# 🆓 GCP Always Free Deployment Guide

Deploy the entire CreditRisk AI platform on **Google Cloud Platform's Always Free Tier** at **$0/month**.

> **Why GCP Always Free?** Always Free tier includes a **Linux VM (e2-micro)**, **Cloud SQL** (PostgreSQL), and **networking** — sufficient to run the full microservices stack with Docker Compose.

---

## What You Get

| Component | Service | Notes |
|-----------|---------|-------|
| All 6 Java microservices | Compute Engine VM (e2-micro) | Docker Compose on the VM |
| PostgreSQL 16 | Cloud SQL Always Free | Managed database, 30GB storage free |
| Kafka + ZooKeeper | Docker on VM | Message broker in containers |
| ML service (FastAPI) | Docker on VM | Python prediction service |
| Frontend (React/nginx) | Docker on VM | Nginx reverse proxy |
| Prometheus + Grafana | Optional profile | Start only when needed |

**Total VM RAM: e2-micro has 1 GB** — We'll optimize JVM settings and disable unnecessary services.

---

## Prerequisites

- Google Cloud Account (free; card required for verification)
- `gcloud` CLI installed locally
- `terraform` installed (optional, for IaC)
- SSH key pair

---

## Step 1 — Create the GCP Project & Enable APIs

```bash
# Create a new project
gcloud projects create creditrisk-ai-free --name="CreditRisk AI"
gcloud config set project creditrisk-ai-free

# Enable required APIs
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

---

## Step 2 — Create a Cloud SQL PostgreSQL Instance

```bash
# Create Always Free PostgreSQL instance (db-f1-micro, shared-core, us-central1)
gcloud sql instances create creditrisk-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --availability-type=ZONAL \
  --storage-size=30GB \
  --enable-bin-log=false \
  --backup-start-time=03:00

# Create root user password
gcloud sql users set-password postgres \
  --instance=creditrisk-db \
  --password=YOUR_SECURE_PASSWORD

# Create databases
gcloud sql databases create creditrisk --instance=creditrisk-db
gcloud sql databases create creditrisk_app --instance=creditrisk-db
gcloud sql databases create creditrisk_risk --instance=creditrisk-db
gcloud sql databases create creditrisk_decision --instance=creditrisk-db
gcloud sql databases create creditrisk_audit --instance=creditrisk-db

# Create app user
gcloud sql users create creditrisk-user \
  --instance=creditrisk-db \
  --password=YOUR_APP_PASSWORD
```

Get the Cloud SQL IP address:
```bash
gcloud sql instances describe creditrisk-db --format='value(ipAddresses[0].ipAddress)'
# Store this as CLOUD_SQL_IP
```

---

## Step 3 — Create the Compute Engine VM

```bash
# Create SSH keys if you don't have them
ssh-keygen -t rsa -f ~/.ssh/gcp-creditrisk -N ""

# Create the VM (e2-micro = 1 vCPU, 1 GB RAM, Always Free)
gcloud compute instances create creditrisk-vm \
  --zone=us-central1-a \
  --machine-type=e2-micro \
  --image-family=ubuntu-2404-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --scopes=default,cloud-platform \
  --metadata-from-file=ssh-keys=gcp-creditrisk.pub

# Get the external IP
gcloud compute instances describe creditrisk-vm \
  --zone=us-central1-a \
  --format='value(networkInterfaces[0].accessConfigs[0].natIP)'
# Store this as VM_EXTERNAL_IP
```

---

## Step 4 — Configure Firewall Rules

```bash
# Allow SSH, HTTP, HTTPS
gcloud compute firewall-rules create allow-ssh-http-https \
  --allow=tcp:22,tcp:80,tcp:443,tcp:3000,tcp:8080 \
  --source-ranges=0.0.0.0/0

# Allow Cloud SQL connections from the VM
# (Get the VM's internal IP)
VM_INTERNAL_IP=$(gcloud compute instances describe creditrisk-vm \
  --zone=us-central1-a \
  --format='value(networkInterfaces[0].networkIP)')

gcloud sql instances patch creditrisk-db \
  --allowed-networks=$VM_INTERNAL_IP/32
```

---

## Step 5 — Set Up the VM

SSH into your VM:
```bash
ssh -i ~/.ssh/gcp-creditrisk ubuntu@VM_EXTERNAL_IP
```

Install Docker:
```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
# Log out and back in for group to take effect
```

Install other tools:
```bash
sudo apt update && sudo apt install -y \
  git \
  openssl \
  curl \
  nano

# Verify Docker
docker --version
```

---

## Step 6 — Clone & Configure CreditRisk AI

```bash
# Create app directory
sudo mkdir -p /opt/creditrisk && sudo chown ubuntu /opt/creditrisk
cd /opt/creditrisk

# Clone the repo
git clone https://github.com/Sparkydev007/creditrisk-ai.git .

# Copy environment template
cp .env.example .env
```

Edit `.env` for GCP deployment:
```bash
nano .env
```

Replace with these values:

```dotenv
# ── Database ─────────────────────────────────────────────
# Use Cloud SQL Public IP (not private socket)
DATABASE_HOST=CLOUD_SQL_IP
DATABASE_PORT=5432
DATABASE_NAME=creditrisk
DATABASE_USERNAME=creditrisk-user
DATABASE_PASSWORD=YOUR_APP_PASSWORD

# ── Security ─────────────────────────────────────────────
# Generate: openssl rand -base64 48
JWT_SECRET=YOUR_GENERATED_JWT_SECRET_HERE
JWT_EXPIRATION_MS=86400000

# ── Kafka ────────────────────────────────────────────────
KAFKA_BOOTSTRAP_SERVERS=kafka:29092
KAFKA_TOPIC_APPLICATION_EVENTS=application-events
KAFKA_TOPIC_RISK_EVENTS=risk-events
KAFKA_TOPIC_DECISION_EVENTS=decision-events
KAFKA_TOPIC_AUDIT_EVENTS=audit-events

# ── Service-to-service (Docker network) ───────────────────
CUSTOMER_SERVICE_URL=http://customer-service:8081
APPLICATION_SERVICE_URL=http://application-service:8082
RISK_SERVICE_URL=http://risk-service:8083
DECISION_SERVICE_URL=http://decision-service:8084
AUDIT_SERVICE_URL=http://audit-service:8085
ML_SERVICE_URL=http://ml-service:8001

# ── Frontend ─────────────────────────────────────────────
# Public URL (used by frontend for API calls)
VITE_API_URL=http://VM_EXTERNAL_IP:8080
CORS_ORIGINS=http://VM_EXTERNAL_IP:3000,http://VM_EXTERNAL_IP:8080

# ── JVM Tuning (e2-micro: 1GB RAM total) ─────────────────
# REDUCED from default: 256m max per service
JAVA_TOOL_OPTIONS=-Xms128m -Xmx256m -XX:+UseSerialGC -XX:MaxRAMPercentage=60.0

# ── Application ──────────────────────────────────────────
SPRING_PROFILES_ACTIVE=gcp
```

---

## Step 7 — Adapt docker-compose.yml for Cloud SQL

Since you're using a **managed Cloud SQL instance** (not a Docker container), modify `docker-compose.yml`:

```bash
# Create a custom override file
cat > docker-compose.override.yml << 'EOF'
version: '3.8'

services:
  # Remove postgres service — use Cloud SQL instead
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_HOST_ADDR: ${DATABASE_HOST}
      POSTGRES_PORT: ${DATABASE_PORT}
    # Don't actually run; just define for dependency checks
    profile: ["never"]

  customer-service:
    environment:
      DATABASE_URL: jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
    depends_on:
      - kafka

  application-service:
    environment:
      DATABASE_URL: jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/creditrisk_app
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
    depends_on:
      - kafka

  risk-service:
    environment:
      DATABASE_URL: jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/creditrisk_risk
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
    depends_on:
      - kafka

  decision-service:
    environment:
      DATABASE_URL: jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/creditrisk_decision
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
    depends_on:
      - kafka

  audit-service:
    environment:
      DATABASE_URL: jdbc:postgresql://${DATABASE_HOST}:${DATABASE_PORT}/creditrisk_audit
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
    depends_on:
      - kafka

  # Disable monitoring on e2-micro (1GB RAM)
  prometheus:
    profile: ["monitoring-disabled"]

  grafana:
    profile: ["monitoring-disabled"]
EOF
```

---

## Step 8 — Initialize Cloud SQL Databases

Create a script to init databases:

```bash
cat > init-cloud-sql.sh << 'EOF'
#!/bin/bash
set -e

CLOUD_SQL_IP="$1"
DB_USER="postgres"
DB_PASSWORD="$2"

# Install PostgreSQL client
sudo apt install -y postgresql-client

# Create databases (run from VM)
export PGPASSWORD=$DB_PASSWORD

for db in creditrisk creditrisk_app creditrisk_risk creditrisk_decision creditrisk_audit; do
  psql -h $CLOUD_SQL_IP -U $DB_USER -c "CREATE DATABASE $db;" || true
done

# Create app user and grant permissions
psql -h $CLOUD_SQL_IP -U $DB_USER << 'SQL'
CREATE USER "creditrisk-user" WITH ENCRYPTED PASSWORD 'YOUR_APP_PASSWORD';
GRANT CONNECT ON DATABASE creditrisk TO "creditrisk-user";
GRANT CONNECT ON DATABASE creditrisk_app TO "creditrisk-user";
GRANT CONNECT ON DATABASE creditrisk_risk TO "creditrisk-user";
GRANT CONNECT ON DATABASE creditrisk_decision TO "creditrisk-user";
GRANT CONNECT ON DATABASE creditrisk_audit TO "creditrisk-user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO "creditrisk-user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO "creditrisk-user";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO "creditrisk-user";
SQL

echo "✅ Cloud SQL databases initialized"
EOF

chmod +x init-cloud-sql.sh

# Run it
./init-cloud-sql.sh CLOUD_SQL_IP postgres_password
```

---

## Step 9 — Launch CreditRisk AI

```bash
# Start only the app stack (no monitoring on e2-micro)
docker compose --profile app up -d --build

# Monitor logs
docker compose logs -f api-gateway

# Wait for services to boot (~2-3 minutes on e2-micro)
docker compose ps
```

Check health:
```bash
curl http://localhost:8080/actuator/health
```

---

## Step 10 — Access the Platform

**Frontend:** `http://VM_EXTERNAL_IP:3000`  
**API Gateway:** `http://VM_EXTERNAL_IP:8080`  
**Swagger UI:** `http://VM_EXTERNAL_IP:8081/swagger-ui.html`

**Demo Credentials:**
- Email: `admin@creditrisk.com`
- Password: `password`

---

## Step 11 — HTTPS with Caddy (Recommended)

```bash
# Install Caddy
sudo apt install -y caddy

# Create Caddyfile
sudo tee /etc/caddy/Caddyfile > /dev/null << EOF
VM_EXTERNAL_IP {
    reverse_proxy localhost:3000
}
EOF

# Enable and start Caddy
sudo systemctl enable caddy
sudo systemctl start caddy

# Update .env CORS_ORIGINS
# CORS_ORIGINS=https://VM_EXTERNAL_IP
# docker compose up -d api-gateway
```

Or use a **real domain** (replace `VM_EXTERNAL_IP` with your domain):

```bash
sudo tee /etc/caddy/Caddyfile > /dev/null << EOF
creditrisk.example.com {
    reverse_proxy localhost:3000
}
EOF

sudo systemctl reload caddy
```

---

## Step 12 — Continuous Deployment (Optional)

The repo includes `.github/workflows/cd.yml`. Set up auto-deploy:

```bash
# On the VM, create override to use GHCR images
cat > docker-compose.override.yml << 'EOF'
services:
  customer-service:
    image: ghcr.io/sparkydev007/creditrisk-ai/customer-service:latest
    build: !reset null
  application-service:
    image: ghcr.io/sparkydev007/creditrisk-ai/application-service:latest
    build: !reset null
  risk-service:
    image: ghcr.io/sparkydev007/creditrisk-ai/risk-service:latest
    build: !reset null
  decision-service:
    image: ghcr.io/sparkydev007/creditrisk-ai/decision-service:latest
    build: !reset null
  audit-service:
    image: ghcr.io/sparkydev007/creditrisk-ai/audit-service:latest
    build: !reset null
  api-gateway:
    image: ghcr.io/sparkydev007/creditrisk-ai/api-gateway:latest
    build: !reset null
  ml-service:
    image: ghcr.io/sparkydev007/creditrisk-ai/ml-service:latest
    build: !reset null
  frontend:
    image: ghcr.io/sparkydev007/creditrisk-ai/frontend:latest
    build: !reset null
EOF

# Create auto-deploy script
cat > deploy.sh << 'EOF'
#!/bin/bash
cd /opt/creditrisk
git fetch origin main
git reset --hard origin/main
docker compose pull
docker compose up -d
EOF

chmod +x deploy.sh
```

Add GitHub Actions secrets to your repo:
- `DEPLOY_HOST`: VM_EXTERNAL_IP
- `DEPLOY_USER`: ubuntu
- `DEPLOY_SSH_KEY`: (contents of your SSH private key)

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `database connection refused` | Cloud SQL not reachable | Check VM firewall allows SQL (port 5432) and database exists |
| `OOM-killed services` | e2-micro only has 1GB | Reduce `JAVA_TOOL_OPTIONS` max heap, disable monitoring |
| `Gateway 503s` | Services still booting | Wait 2-3 min; check `docker compose logs api-gateway` |
| `Frontend API calls fail` | CORS origin mismatch | Ensure `CORS_ORIGINS` matches browser URL exactly |
| `Docker build fails` | e2-micro out of disk | `docker system prune -a` to free space |
| `Kafka connection refused` | Kafka still starting | Wait for healthcheck; `docker compose logs kafka` |

---

## Monitoring Resources

```bash
# VM CPU/Memory
watch -n 2 'free -h && df -h && docker stats'

# Service logs
docker compose logs -f api-gateway
docker compose logs -f risk-service

# Database connections
docker exec -it $(docker ps -q -f "image=postgres") \
  psql -U creditrisk -c "SELECT count(*) FROM pg_stat_activity;"
```

---

## Cost Estimate

| Service | Free Tier | Cost |
|---------|-----------|------|
| Compute Engine (e2-micro) | 730 hours/month | **$0** |
| Cloud SQL (db-f1-micro) | 30GB storage | **$0** |
| Networking (egress < 1GB/month) | 1GB free/month | **$0** |
| **Total** | — | **$0/month** |

> ⚠️ Costs **only if you exceed free tier** (e.g., >730 hours of a larger instance, >100GB egress/month).

---

## Cleanup (When Done)

To avoid any charges:

```bash
# Delete the VM
gcloud compute instances delete creditrisk-vm --zone=us-central1-a

# Delete Cloud SQL instance
gcloud sql instances delete creditrisk-db

# Delete firewall rules
gcloud compute firewall-rules delete allow-ssh-http-https

# Delete the project (optional)
gcloud projects delete creditrisk-ai-free
```

---

## Next Steps

- 📊 **Enable Cloud Monitoring** for dashboards and alerts
- 🔐 **Set up Cloud Armor** for DDoS protection
- 📈 **Use Cloud Logging** instead of local Prometheus for long-term metrics
- 🚀 **Deploy frontend to Vercel** for global CDN coverage
- 🔄 **Set up GitHub Actions** for automated deployments

---

**Last Updated:** October 2026  
**Verified on:** GCP Always Free Tier (e2-micro + db-f1-micro)
