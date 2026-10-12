# ☁️ GCP Deployment Guide (Cloud Run)

Deploy the entire CreditRisk AI platform — all 6 Java services, the ML service, PostgreSQL, frontend — to **Google Cloud Run**, with infrastructure-as-code via Terraform and CI/CD via GitHub Actions.

> This is the GCP equivalent of the [Oracle Always-Free deployment](free-cloud-deployment.md). Cloud Run prices per-request and scales to zero, so costs track actual usage instead of a fixed VM bill.

---

## What you get

| Component | Service | Notes |
|-----------|---------|-------|
| Frontend | Cloud Run | nginx serving static build; `/api` proxied to gateway |
| API Gateway | Cloud Run | Spring Cloud Gateway on port 8080 |
| Customer service | Cloud Run | port 8081 |
| Application service | Cloud Run | port 8082 |
| Risk service | Cloud Run | port 8083 |
| Decision service | Cloud Run | port 8084 |
| Audit service | Cloud Run | port 8085 |
| ML service | Cloud Run | FastAPI / Python 3.11 on port 8001 |
| PostgreSQL | Cloud SQL | 5 databases (one per service), backups + PITR enabled |
| Secrets | Secret Manager | db password, JWT secret |
| Images | Artifact Registry | `creditrisk` docker repo, one image per service |

Autoscaling is capped at 2 instances per service to keep costs bounded. JVM services run with `-XX:MaxRAMPercentage=75.0` and 512Mi memory limits.

---

## File map

```
infrastructure/
├── cloudbuild.yaml             # Cloud Build pipeline (equivalent of deploy-gcp.yml)
├── cloudrun/
│   ├── api-gateway.service.yaml        # per-service Cloud Run manifests
│   ├── customer-service.service.yaml
│   ├── application-service.service.yaml
│   ├── risk-service.service.yaml
│   ├── decision-service.service.yaml
│   ├── audit-service.service.yaml
│   ├── ml-service.service.yaml
│   └── frontend.service.yaml
└── terraform-gcp/
    ├── main.tf                 # APIs, Artifact Registry, Cloud SQL, IAM, secrets
    └── variables.tf

frontend/
├── Dockerfile                  # docker-compose variant (port 3000)
└── Dockerfile.cloudrun         # cloud run variant (listens on $PORT)

.github/workflows/deploy-gcp.yml # CI/CD: build → push → deploy
scripts/render-gcp-manifests.sh  # substitute PROJECT_ID/REGION/REPO into manifests
```

---

## Step 1 — Prerequisites

- `gcloud` CLI installed and authenticated (`gcloud auth login`)
- A GCP project with billing enabled
- Terraform ≥ 1.5
- Repo admin access (for the CI/CD secrets)

```bash
export PROJECT_ID=your-project-id
export REGION=europe-west1
gcloud config set project "$PROJECT_ID"
```

## Step 2 — Provision infrastructure (Terraform)

```bash
cd infrastructure/terraform-gcp

terraform init
terraform plan  -var project_id="$PROJECT_ID" \
                -var db_password="$(openssl rand -base64 24)" \
                -var jwt_secret="$(openssl rand -base64 48)"
terraform apply -var project_id="$PROJECT_ID" \
                -var db_password="$(openssl rand -base64 24)" \
                -var jwt_secret="$(openssl rand -base64 48)"
```

⚠️ Use the **same** generated values in both steps and record them — `db_password` must be re-supplied each plan/apply (it's marked sensitive and not stored in state). Save them to `.env` locally.

What was created:
- `creditrisk` Cloud SQL instance (PostgreSQL 16) with 5 databases + `creditrisk` user
- `creditrisk-run` service account with `cloudsql.client`, `artifactregistry.reader`, `secretmanager.secretAccessor`, `logging.logWriter`
- Secret Manager entries `creditrisk-db-password` and `creditrisk-jwt-secret`

> Cloud SQL is created with `deletion_protection = false` so the stack is destroyable end-to-end for demos. Flip to `true` for anything you care about.

## Step 3 — Kafka

Cloud Run has no Managed Kafka. Two options:

**Option A (recommended for real deployments):** Confluent Cloud / Upstash / self-hosted Kafka in GKE, then update `KAFKA_BOOTSTRAP_SERVERS` in each service manifest.

**Option B (acceptable for demos):** Leave the value as-is — Spring Kafka consumers will retry and log connection errors; the synchronous request/response flow still works. Event-driven flows (ApplicationSubmitted → Risk → Decision → Audit) will be inert.

Rendered manifests reference `creditrisk-kafka-servers` from Secret Manager; create it even if unused:

```bash
echo -n "your-kafka-bootstrap:9092" | gcloud secrets create creditrisk-kafka-servers --data-file=-
```

## Step 4 — First deploy

Manual:

```bash
# Render manifests with real values
./scripts/render-gcp-manifests.sh "$PROJECT_ID" "$REGION" creditrisk

# Build & push images
gcloud auth configure-docker "$REGION-docker.pkg.dev" --quiet
cd "$(git rev-parse --show-toplevel)"
REG="$REGION-docker.pkg.dev/$PROJECT_ID/creditrisk"
for svc in api-gateway customer-service application-service risk-service decision-service audit-service; do
  docker build -t "$REG/$svc:latest" -f "services/$svc/Dockerfile" . &
done
docker build -t "$REG/ml-service:latest" ml-service &
docker build -f frontend/Dockerfile.cloudrun \
  --build-arg GATEWAY_UPSTREAM="http://api-gateway.$REGION.run.app" \
  -t "$REG/frontend:latest" frontend &
wait
for svc in api-gateway customer-service application-service risk-service decision-service audit-service ml-service frontend; do
  docker push "$REG/$svc:latest" &
done; wait

# Deploy
for svc in api-gateway customer-service application-service risk-service decision-service audit-service ml-service; do
  gcloud run services replace "/tmp/creditrisk-gcp/$svc.service.yaml" --region "$REGION" --quiet
done
sleep 10
GATEWAY_URL=$(gcloud run services describe api-gateway --region "$REGION" --format 'value(status.url)')
sed -i "s|GATEWAY_UPSTREAM_PLACEHOLDER|$GATEWAY_URL|g" /tmp/creditrisk-gcp/frontend.service.yaml
gcloud run services replace /tmp/creditrisk-gcp/frontend.service.yaml --region "$REGION" --quiet
gcloud run services add-iam-policy-binding frontend --region "$REGION" \
  --member=allUsers --role=roles/run.invoker --quiet
```

Cloud Build alternative (no GH Actions needed):

```bash
gcloud builds submit --config infrastructure/cloudbuild.yaml \
  --substitutions=_REGION=$REGION,_REPO=creditrisk \
  --project "$PROJECT_ID" .
```

## Step 5 — CI/CD (push to main = deploy)

Add repo variables and secrets (`.github/workflows/deploy-gcp.yml`):

| Type | Name | Value |
|------|------|-------|
| Variable | `GCP_PROJECT_ID` | your project id |
| Variable | `GCP_REGION` | e.g. `europe-west1` |
| Secret | `WIF_PROVIDER` | `projects/<num>/locations/global/workloadIdentityPools/<pool>/providers/<provider>` |
| Secret | `WIF_SA_EMAIL` | deployer service account email |

Set up Workload Identity Federation once:

```bash
gcloud iam workload-identity-pools create github-pool \
  --location=global --display-name="GitHub Actions pool"
gcloud iam workload-identity-pools providers create-oidc github-provider \
  --location=global --workload-identity-pool=github-pool \
  --issuer-uri="https://token.actions.githubusercontent.com" \
  --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository" \
  --attribute-condition="assertion.repository=='prathmesh-bunde/creditrisk-ai'"

# Grant the deployer SA permission to impersonate & act
POOL_ID=$(gcloud iam workload-identity-pools describe github-pool --location=global --format 'value(name)')
gcloud iam service-accounts add-iam-policy-binding creditrisk-deployer@"$PROJECT_ID".iam.gserviceaccount.com \
  --role=roles/iam.workloadIdentityUser \
  --member="principalSet://iam.googleapis.com/${POOL_ID#projects/*/locations/global/*}" # adjust per output
```

> ⚠️ The `add-iam-policy-binding` command's `member` value must be copied from the actual pool resource name printed by the CLI — don't run the snippet above verbatim.

The deployer SA (`creditrisk-deployer`) then needs: `roles/run.admin`, `roles/iam.serviceAccountUser`, `roles/artifactregistry.writer`, `roles/cloudbuild.builds.builder`.

## Step 6 — Verify the deployment

```bash
# Per-service endpoints
for svc in api-gateway customer-service application-service risk-service decision-service audit-service ml-service frontend; do
  echo "$svc: $(gcloud run services describe "$svc" --region "$REGION" --format 'value(status.url)')"
done

# Health check through the gateway
curl -s "$(gcloud run services describe api-gateway --region "$REGION" --format 'value(status.url)')/actuator/health"

# Frontend
open "$(gcloud run services describe frontend --region "$REGION" --format 'value(status.url)')"
```

Log in with the demo accounts from the README (`admin@creditrisk.com` / `password`).

---

## Costs

| Resource | Config | Est. monthly |
|----------|--------|--------------|
| Cloud Run × 8 | 1 vCPU / 512Mi, maxScale 2 | ~$5–20 depending on traffic |
| Cloud SQL | `db-f1-micro`, 10GB SSD | ~$15 |
| Artifact Registry | image storage | ~$0.50 |
| Secret Manager | 2 secrets | ~$0.02 |
| **Total** | | **~$20–35 / month** |

Scale each service's `maxScale` annotation to `0` to park the platform (per-request pricing makes this near-free).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "Cloud SQL connection failed" in logs | Confirm `creditrisk-db-password` secret exists and `roles/cloudsql.client` is on `creditrisk-run` SA |
| Gateway up but services 503 | Each Cloud Run service needs IAM binding to be reachable *internally*; manifests set `ingress: internal` which requires VPC connector setup — switch to `ingress: all` + no public IAM binding for lowest friction |
| Kafka errors spamming logs | Expected if no Kafka is configured — see Step 3 |
| Frontend loads but API calls fail | CORS — set `CORS_ORIGINS` in `api-gateway.service.yaml` to your frontend Cloud Run URL |
| ImageNotFound during deploy | Build/push step didn't run for that service — check the docker build logs |

---

*Last verified: October 2026 — tested against Terraform provider `~> 5.30` and gcloud CLI 490+.*
