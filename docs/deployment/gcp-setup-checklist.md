# 🚀 GCP Always Free Setup Checklist

Follow these steps **in order**. Copy-paste the commands.

---

## ✅ Step 1: Set GCP Project Variables

```bash
export GCP_PROJECT_ID="creditrisk-ai"  # Change if different
export GCP_REGION="us-central1"
export GCP_ZONE="us-central1-a"
export VM_NAME="creditrisk-vm"
export DB_INSTANCE="creditrisk-db"

# Verify
echo "Project: $GCP_PROJECT_ID"
echo "Region: $GCP_REGION"
```

Set project in gcloud:
```bash
gcloud config set project $GCP_PROJECT_ID
gcloud auth login  # If not already authenticated
```

---

## ✅ Step 2: Enable Required APIs

```bash
gcloud services enable compute.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable cloudresourcemanager.googleapis.com
```

Wait for completion (takes ~1-2 min).

---

## ✅ Step 3: Create Cloud SQL PostgreSQL Instance

```bash
# Generate a secure root password
ROOT_PASSWORD=$(openssl rand -base64 24)
echo "Cloud SQL Root Password: $ROOT_PASSWORD" > /tmp/gcp-creds.txt

# Create the instance (db-f1-micro = Always Free)
gcloud sql instances create $DB_INSTANCE \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=$GCP_REGION \
  --availability-type=ZONAL \
  --storage-size=30GB \
  --enable-bin-log=false \
  --backup-start-time=03:00 \
  --no-backup

echo "✅ Cloud SQL instance created"

# Wait for it to be ready
echo "Waiting for Cloud SQL to be ready..."
sleep 30
```

---

## ✅ Step 4: Set Cloud SQL Root Password

```bash
gcloud sql users set-password postgres \
  --instance=$DB_INSTANCE \
  --password="$ROOT_PASSWORD"

echo "✅ Root password set"
```

---

## ✅ Step 5: Create Databases

```bash
# Get Cloud SQL IP
CLOUD_SQL_IP=$(gcloud sql instances describe $DB_INSTANCE \
  --format='value(ipAddresses[0].ipAddress)')

echo "Cloud SQL IP: $CLOUD_SQL_IP"
echo $CLOUD_SQL_IP > /tmp/cloud-sql-ip.txt

# Create databases
for db in creditrisk creditrisk_app creditrisk_risk creditrisk_decision creditrisk_audit; do
  gcloud sql databases create $db --instance=$DB_INSTANCE
done

echo "✅ Databases created"
```

---

## ✅ Step 6: Create App Database User

```bash
# Generate app user password
APP_DB_PASSWORD=$(openssl rand -base64 24)
echo "App DB Password: $APP_DB_PASSWORD" >> /tmp/gcp-creds.txt

# Create the user
gcloud sql users create creditrisk-user \
  --instance=$DB_INSTANCE \
  --password="$APP_DB_PASSWORD"

echo "✅ App database user created"
echo "Saved credentials to /tmp/gcp-creds.txt"
```

---

## ✅ Step 7: Create SSH Key Pair (if you don't have one)

```bash
# Generate SSH key
ssh-keygen -t rsa -f ~/.ssh/gcp-creditrisk -N ""

# Get the public key
cat ~/.ssh/gcp-creditrisk.pub
```

---

## ✅ Step 8: Create the Compute Engine VM

```bash
# Create e2-micro VM (Always Free)
gcloud compute instances create $VM_NAME \
  --zone=$GCP_ZONE \
  --machine-type=e2-micro \
  --image-family=ubuntu-2404-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --scopes=default,cloud-platform \
  --no-service-account

echo "✅ VM created"

# Wait for VM to be ready
echo "Waiting for VM to be ready..."
sleep 15
```

---

## ✅ Step 9: Get VM External IP

```bash
VM_EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME \
  --zone=$GCP_ZONE \
  --format='value(networkInterfaces[0].accessConfigs[0].natIP)')

echo "VM External IP: $VM_EXTERNAL_IP"
echo $VM_EXTERNAL_IP > /tmp/vm-ip.txt

# Save for later
export VM_EXTERNAL_IP=$VM_EXTERNAL_IP
```

---

## ✅ Step 10: Create Firewall Rules

```bash
# Get VM internal IP for Cloud SQL access
VM_INTERNAL_IP=$(gcloud compute instances describe $VM_NAME \
  --zone=$GCP_ZONE \
  --format='value(networkInterfaces[0].networkIP)')

echo "VM Internal IP: $VM_INTERNAL_IP"

# Allow SSH, HTTP, HTTPS, and app ports
gcloud compute firewall-rules create allow-creditrisk-web \
  --allow=tcp:22,tcp:80,tcp:443,tcp:3000,tcp:8080 \
  --source-ranges=0.0.0.0/0

# Allow Cloud SQL from VM
gcloud sql instances patch $DB_INSTANCE \
  --allowed-networks=$VM_INTERNAL_IP/32

echo "✅ Firewall rules configured"
```

---

## ✅ Step 11: SSH into the VM

```bash
# Wait for SSH to be ready
echo "Waiting for VM SSH to be ready (60 seconds)..."
sleep 60

# SSH in
ssh -i ~/.ssh/gcp-creditrisk ubuntu@$VM_EXTERNAL_IP
```

---

## ✅ Step 12: On the VM - Install Docker

**RUN THESE COMMANDS ON THE VM (after SSH):**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Add ubuntu to docker group
sudo usermod -aG docker ubuntu

# Install git and other tools
sudo apt install -y git openssl curl nano

# Log out and back in for group changes
exit
```

Then SSH back in:
```bash
ssh -i ~/.ssh/gcp-creditrisk ubuntu@$VM_EXTERNAL_IP
```

Verify Docker:
```bash
docker --version
docker ps
```

---

## ✅ Step 13: On the VM - Clone CreditRisk AI

```bash
# Create app directory
sudo mkdir -p /opt/creditrisk
sudo chown ubuntu /opt/creditrisk
cd /opt/creditrisk

# Clone the repo
git clone https://github.com/Sparkydev007/creditrisk-ai.git .

# Copy env template
cp .env.example .env

echo "✅ Repository cloned"
```

---

## ✅ Step 14: On the VM - Create .env File

Create the environment file with your values:

```bash
cat > .env << 'ENVEOF'
# ── Database (Cloud SQL) ──────────────────
DATABASE_HOST=REPLACE_CLOUD_SQL_IP
DATABASE_PORT=5432
DATABASE_NAME=creditrisk
DATABASE_USERNAME=creditrisk-user
DATABASE_PASSWORD=REPLACE_APP_DB_PASSWORD

# ── Security ──────────────────────────────
JWT_SECRET=REPLACE_JWT_SECRET
JWT_EXPIRATION_MS=86400000

# ── Kafka (Docker on VM) ──────────────────
KAFKA_BOOTSTRAP_SERVERS=kafka:29092
KAFKA_TOPIC_APPLICATION_EVENTS=application-events
KAFKA_TOPIC_RISK_EVENTS=risk-events
KAFKA_TOPIC_DECISION_EVENTS=decision-events
KAFKA_TOPIC_AUDIT_EVENTS=audit-events

# ── Services (Docker network) ─────────────
CUSTOMER_SERVICE_URL=http://customer-service:8081
APPLICATION_SERVICE_URL=http://application-service:8082
RISK_SERVICE_URL=http://risk-service:8083
DECISION_SERVICE_URL=http://decision-service:8084
AUDIT_SERVICE_URL=http://audit-service:8085
ML_SERVICE_URL=http://ml-service:8001

# ── Frontend ──────────────────────────────
VITE_API_URL=http://REPLACE_VM_EXTERNAL_IP:8080
CORS_ORIGINS=http://REPLACE_VM_EXTERNAL_IP:3000,http://REPLACE_VM_EXTERNAL_IP:8080

# ── JVM Tuning (e2-micro: 1GB RAM) ────────
JAVA_TOOL_OPTIONS=-Xms128m -Xmx256m -XX:+UseSerialGC -XX:MaxRAMPercentage=60.0

# ── Application ───────────────────────────
SPRING_PROFILES_ACTIVE=gcp
ENVEOF

echo "✅ .env file created"
```

**Replace these values:**
- `REPLACE_CLOUD_SQL_IP` → From `/tmp/cloud-sql-ip.txt`
- `REPLACE_APP_DB_PASSWORD` → From `/tmp/gcp-creds.txt`
- `REPLACE_JWT_SECRET` → Run: `openssl rand -base64 48`
- `REPLACE_VM_EXTERNAL_IP` → From `/tmp/vm-ip.txt`

---

## ✅ Step 15: On the VM - Create docker-compose.override.yml

This file tells Docker Compose to use Cloud SQL instead of the local Postgres:

```bash
cat > docker-compose.override.yml << 'OVERRIDEEOF'
version: '3.8'

services:
  # Don't run local postgres - use Cloud SQL instead
  postgres:
    profiles: ["never"]

  # Disable monitoring to save RAM on e2-micro
  prometheus:
    profiles: ["disabled"]

  grafana:
    profiles: ["disabled"]

  # Update services to use Cloud SQL
  customer-service:
    depends_on:
      - kafka

  application-service:
    depends_on:
      - kafka

  risk-service:
    depends_on:
      - kafka

  decision-service:
    depends_on:
      - kafka

  audit-service:
    depends_on:
      - kafka
OVERRIDEEOF

echo "✅ docker-compose.override.yml created"
```

---

## ✅ Step 16: On the VM - Start the Application

```bash
# Navigate to app directory
cd /opt/creditrisk

# Start services (no local postgres, no monitoring)
docker compose --profile app up -d --build

echo "⏳ Building images and starting services..."
echo "   This takes 10-20 minutes on e2-micro (first build only)"

# Monitor the build
docker compose logs -f api-gateway
```

**Wait until you see:**
```
api-gateway | ... Started GatewayApplication in ...
```

Then press `Ctrl+C` to exit logs.

---

## ✅ Step 17: Verify Services Are Running

```bash
# Check all services
docker compose ps

# Check API Gateway health
curl http://localhost:8080/actuator/health

# Expected response:
# {"status":"UP"}
```

---

## ✅ Step 18: Access the Application

**Frontend:** http://$VM_EXTERNAL_IP:3000  
**API Gateway:** http://$VM_EXTERNAL_IP:8080  
**Swagger UI:** http://$VM_EXTERNAL_IP:8081/swagger-ui.html

**Demo Credentials:**
- Email: `admin@creditrisk.com`
- Password: `password`

---

## 🆘 Troubleshooting

### Services won't start / OOM-killed

```bash
# Check logs
docker compose logs api-gateway

# If OOM: reduce JAVA_TOOL_OPTIONS in .env
# Current: -Xms128m -Xmx256m
# Try: -Xms64m -Xmx128m
```

### Can't connect to database

```bash
# Check if Cloud SQL IP is reachable
ping CLOUD_SQL_IP

# Check if databases exist
docker exec -it $(docker ps -q -f "image=postgres") \
  psql -h $CLOUD_SQL_IP -U creditrisk-user -c "\l"
```

### Frontend loads but API calls fail

```bash
# Check CORS_ORIGINS in .env
cat .env | grep CORS_ORIGINS

# Must match browser URL exactly (scheme + host + port)
# If you opened http://1.2.3.4:3000, CORS_ORIGINS must include http://1.2.3.4:3000
```

### Kafka connection refused

```bash
docker compose logs kafka
# Wait for healthcheck to pass (green check)
# Services depend on Kafka, so wait ~30 sec for all to be healthy
```

---

## 🎯 Next Steps

After the app is running:

1. **Test the workflow**
   - Create a customer
   - Submit a credit application
   - Check the risk assessment and decision

2. **Enable HTTPS** (optional)
   ```bash
   sudo apt install -y caddy
   # Add your domain + configure reverse proxy
   ```

3. **Set up CI/CD** (optional)
   - Add GitHub Actions secrets to auto-deploy

4. **Monitor logs**
   ```bash
   docker compose logs -f
   ```

5. **Scale down if needed**
   - Disable unused services with profiles
   - Monitor memory with `docker stats`

---

## 📊 Cost Check

**You should pay:** $0/month

**Verify in GCP Console:**
- Billing → Active projects → "Credit Risk"
- Compute Engine → e2-micro (free)
- Cloud SQL → db-f1-micro (free)

If costs appear, check:
- VM is e2-micro (not upgraded)
- Cloud SQL is db-f1-micro
- No persistent disks >30GB
- Network egress <1GB/month
