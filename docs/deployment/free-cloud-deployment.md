# 🆓 Free Cloud Deployment Guide (Oracle Cloud Always Free)

Deploy the entire CreditRisk AI platform — all 6 Java services, the ML service, Kafka, PostgreSQL, frontend, and observability stack — on a **$0/month Oracle Cloud VM**.

> **Why Oracle Cloud?** PaaS free tiers (Render, Railway, Zeabur, Fly.io) either don't run Kafka, don't allow long-running JVM processes, or no longer accept free projects (Zeabur's shared cluster closed to new projects in Feb 2026). Oracle's Always Free tier gives you a real ARM VM with 2 OCPU + 12 GB RAM that comfortably runs this whole stack with the memory tuning already applied in this repo's `docker-compose.yml`.

---

## What you get

| Component | Where | Notes |
|-----------|-------|-------|
| All 6 Java microservices | Docker Compose on the VM | JVM capped at 512MB each via `JAVA_TOOL_OPTIONS` |
| PostgreSQL 16 | Docker container | All 4 databases created by init script |
| Kafka + ZooKeeper | Docker container | Heap capped at 512MB |
| ML service (FastAPI) | Docker container | Rule-based fallback if model missing |
| Frontend (React/nginx) | Docker container | Proxies `/api` to gateway |
| Prometheus + Grafana | Optional profile | Start only when needed to save RAM |

**Total RAM usage: ~5.5–6.5 GB** — fits the free 12 GB VM.

---

## Step 1 — Create the VM

1. Sign up at [cloud.oracle.com](https://cloud.oracle.com) (free; card required for verification but not charged on Always Free).
2. Create a Compute Instance:
   - **Image:** Ubuntu 22.04 (or 24.04)
   - **Shape:** `VM.Standard.A1.Flex`, **2 OCPU / 12 GB** (the Always Free ARM allocation)
   - **Boot volume:** 50 GB (free tier includes 200 GB total block storage)
   - **SSH keys:** add your public key
3. Open network ports: VCN → Security List → Add Ingress Rule: source `0.0.0.0/0`, TCP ports **80, 443** (and **3000/8080** for testing).
4. Note the **public IP address**.

> ⚠️ Free ARM instances are popular and often "out of capacity" in busy regions. Retry at off-peak times, or try a less-crowded region (e.g. us-chicago-1, eu-frankfurt-1) — the upgradable-to-paid workaround also works if all else fails.

## Step 2 — Prepare the server

```bash
ssh ubuntu@<VM_PUBLIC_IP>

# Install Docker (official convenience script)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
# log out and back in for group change
```

## Step 3 — Get the code + env

```bash
sudo mkdir -p /opt/creditrisk && sudo chown ubuntu /opt/creditrisk
git clone https://github.com/prathmesh-bunde/creditrisk-ai.git /opt/creditrisk
cd /opt/creditrisk

cp .env.example .env
openssl rand -base64 48   # generate a JWT secret, put it in .env
nano .env                  # set JWT_SECRET, CORS_ORIGINS=http://<VM_IP>:3000
```

## Step 4 — Launch

```bash
docker compose --profile app up -d --build
```

First build takes ~10–20 min on 2 OCPUs (Maven builds 6 services; subsequent builds are fast thanks to Docker layer caching).

Check status:

```bash
docker compose ps
docker compose logs -f api-gateway     # watch the gateway come up
curl http://localhost:8080/actuator/health
```

The frontend is at `http://<VM_PUBLIC_IP>:3000` and proxies `/api/*` to the gateway.

## Step 5 — Optional: observability

```bash
docker compose --profile monitoring up -d
```

Grafana at `http://<VM_IP>:3001` (admin/admin). Stop it afterward to save RAM:

```bash
docker compose --profile monitoring stop
```

## Step 6 — HTTPS + a real domain (optional but recommended)

1. Point a domain (e.g. `creditrisk.yourname.dev`) A-record at the VM IP.
2. Install Caddy as a reverse proxy — automatic Let's Encrypt:

```bash
sudo apt install -y caddy
sudo nano /etc/caddy/Caddyfile
```

```
creditrisk.yourname.dev {
    reverse_proxy localhost:3000
}
```

```bash
sudo systemctl reload caddy
```

Update `.env` → `CORS_ORIGINS=https://creditrisk.yourname.dev` and `docker compose up -d api-gateway` to apply.

### Alternative: frontend on Vercel + API on the VM

Keep the frontend at Vercel (already configured with `vercel.json`):

1. Edit `frontend/vercel.json` → replace `REPLACE-WITH-YOUR-API-HOST` with your VM's address (e.g. `http://<VM_IP>` or `https://creditrisk.yourname.dev`).
2. Redeploy the frontend (`vercel --prod` or push).
3. Set `.env` → `CORS_ORIGINS=https://<your-vercel-domain>` on the VM and restart the gateway.

## Step 7 — CI/CD (push to deploy)

The repo includes `.github/workflows/cd.yml`, which builds all 8 images (multi-arch, incl. ARM) and pushes them to GHCR on every push to `main`.

To enable auto-deploy to the VM, add repo **Actions secrets**:

| Secret | Value |
|--------|-------|
| `DEPLOY_HOST` | VM public IP |
| `DEPLOY_USER` | `ubuntu` |
| `DEPLOY_SSH_KEY` | private key contents |

And a repo **variable**: `DEPLOY_HOST` (same as secret — used to gate the job).

On the VM, create `/opt/creditrisk/docker-compose.override.yml` that uses GHCR images instead of local builds:

```yaml
services:
  customer-service:
    image: ghcr.io/prathmesh-bunde/creditrisk-ai/customer-service:latest
    build: !reset null
  application-service:
    image: ghcr.io/prathmesh-bunde/creditrisk-ai/application-service:latest
    build: !reset null
  risk-service:
    image: ghcr.io/prathmesh-bunde/creditrisk-ai/risk-service:latest
    build: !reset null
  decision-service:
    image: ghcr.io/prathmesh-bunde/creditrisk-ai/decision-service:latest
    build: !reset null
  audit-service:
    image: ghcr.io/prathmesh-bunde/creditrisk-ai/audit-service:latest
    build: !reset null
  api-gateway:
    image: ghcr.io/prathmesh-bunde/creditrisk-ai/api-gateway:latest
    build: !reset null
  ml-service:
    image: ghcr.io/prathmesh-bunde/creditrisk-ai/ml-service:latest
    build: !reset null
  frontend:
    image: ghcr.io/prathmesh-bunde/creditrisk-ai/frontend:latest
    build: !reset null
```

Now `git push` to `main` = fully deployed in minutes with zero VM CPU spent on builds.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `docker compose up` OOM-kills containers | Confirm `.env` has `JAVA_TOOL_OPTIONS` from `.env.example`; stop monitoring profile |
| Gateway 503s | `docker compose logs api-gateway` — services may still be booting; JVMs take ~30–60s |
| Frontend loads but API calls fail | Check `CORS_ORIGINS` in `.env` matches the browser origin exactly (scheme + host + port) |
| Kafka connection refused | `docker compose logs kafka` — wait for healthcheck to pass before backend services start |
| Instance "out of capacity" | Retry later / different region — see note in Step 1 |

---

*Last verified: September 2026 — OCI Always Free ARM allocation is currently 2 OCPU / 12 GB (halved from 4/24 in June 2026; still fits this stack).*
