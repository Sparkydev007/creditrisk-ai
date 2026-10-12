#!/bin/bash

################################################################################
# CreditRisk AI - GCP Always Free Automated Setup
# 
# This script automates the entire deployment:
# - Cloud SQL PostgreSQL (db-f1-micro)
# - Compute Engine VM (e2-micro)
# - Docker Compose with all services
# - Frontend access
#
# Usage:
#   chmod +x gcp-deploy.sh
#   ./gcp-deploy.sh
#
# Requirements:
#   - gcloud CLI installed and authenticated
#   - SSH key at ~/.ssh/gcp-creditrisk (or generates one)
################################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
GCP_PROJECT_ID="${1:-creditrisk-ai}"
GCP_REGION="us-central1"
GCP_ZONE="us-central1-a"
VM_NAME="creditrisk-vm"
DB_INSTANCE="creditrisk-db"
SSH_KEY_PATH="$HOME/.ssh/gcp-creditrisk"

echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  CreditRisk AI - GCP Always Free Setup                      ║${NC}"
echo -e "${GREEN}║  Project: $GCP_PROJECT_ID${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Set GCP Project
echo -e "${YELLOW}[1/15]${NC} Setting GCP project..."
gcloud config set project $GCP_PROJECT_ID
gcloud config set compute/region $GCP_REGION
gcloud config set compute/zone $GCP_ZONE
echo -e "${GREEN}✓ Project set${NC}"
echo ""

# Step 2: Enable APIs
echo -e "${YELLOW}[2/15]${NC} Enabling required APIs..."
gcloud services enable compute.googleapis.com sqladmin.googleapis.com cloudresourcemanager.googleapis.com
echo -e "${GREEN}✓ APIs enabled${NC}"
echo ""

# Step 3: Generate credentials
echo -e "${YELLOW}[3/15]${NC} Generating secure credentials..."
ROOT_PASSWORD=$(openssl rand -base64 24)
APP_DB_PASSWORD=$(openssl rand -base64 24)
JWT_SECRET=$(openssl rand -base64 48)
echo -e "${GREEN}✓ Credentials generated${NC}"
echo ""

# Step 4: Generate SSH key if needed
echo -e "${YELLOW}[4/15]${NC} Setting up SSH key..."
if [ ! -f "$SSH_KEY_PATH" ]; then
  ssh-keygen -t rsa -f "$SSH_KEY_PATH" -N "" -q
  echo -e "${GREEN}✓ SSH key generated at $SSH_KEY_PATH${NC}"
else
  echo -e "${GREEN}✓ SSH key already exists${NC}"
fi
echo ""

# Step 5: Create Cloud SQL instance
echo -e "${YELLOW}[5/15]${NC} Creating Cloud SQL PostgreSQL instance (db-f1-micro)..."
gcloud sql instances create $DB_INSTANCE \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=$GCP_REGION \
  --availability-type=ZONAL \
  --storage-size=30GB \
  --enable-bin-log=false \
  --backup-start-time=03:00 \
  --no-backup \
  2>/dev/null || echo -e "${YELLOW}⚠ Database instance may already exist${NC}"

echo -e "${GREEN}✓ Waiting for Cloud SQL to be ready...${NC}"
sleep 30
echo ""

# Step 6: Set Cloud SQL root password
echo -e "${YELLOW}[6/15]${NC} Setting Cloud SQL root password..."
gcloud sql users set-password postgres \
  --instance=$DB_INSTANCE \
  --password="$ROOT_PASSWORD"
echo -e "${GREEN}✓ Root password set${NC}"
echo ""

# Step 7: Create databases
echo -e "${YELLOW}[7/15]${NC} Creating databases..."
for db in creditrisk creditrisk_app creditrisk_risk creditrisk_decision creditrisk_audit; do
  gcloud sql databases create $db --instance=$DB_INSTANCE 2>/dev/null || true
done
echo -e "${GREEN}✓ Databases created${NC}"
echo ""

# Step 8: Create app database user
echo -e "${YELLOW}[8/15]${NC} Creating app database user..."
gcloud sql users create creditrisk-user \
  --instance=$DB_INSTANCE \
  --password="$APP_DB_PASSWORD" 2>/dev/null || echo -e "${YELLOW}⚠ User may already exist${NC}"
echo -e "${GREEN}✓ App user created${NC}"
echo ""

# Step 9: Get Cloud SQL IP
echo -e "${YELLOW}[9/15]${NC} Getting Cloud SQL IP address..."
CLOUD_SQL_IP=$(gcloud sql instances describe $DB_INSTANCE --format='value(ipAddresses[0].ipAddress)')
echo -e "${GREEN}✓ Cloud SQL IP: $CLOUD_SQL_IP${NC}"
echo ""

# Step 10: Create Compute Engine VM
echo -e "${YELLOW}[10/15]${NC} Creating Compute Engine VM (e2-micro)..."
gcloud compute instances create $VM_NAME \
  --zone=$GCP_ZONE \
  --machine-type=e2-micro \
  --image-family=ubuntu-2404-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-standard \
  --scopes=default,cloud-platform \
  --no-service-account \
  2>/dev/null || echo -e "${YELLOW}⚠ VM may already exist${NC}"

echo -e "${GREEN}✓ Waiting for VM to be ready...${NC}"
sleep 20
echo ""

# Step 11: Get VM IPs
echo -e "${YELLOW}[11/15]${NC} Getting VM IP addresses..."
VM_EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME \
  --zone=$GCP_ZONE \
  --format='value(networkInterfaces[0].accessConfigs[0].natIP)')
VM_INTERNAL_IP=$(gcloud compute instances describe $VM_NAME \
  --zone=$GCP_ZONE \
  --format='value(networkInterfaces[0].networkIP)')
echo -e "${GREEN}✓ External IP: $VM_EXTERNAL_IP${NC}"
echo -e "${GREEN}✓ Internal IP: $VM_INTERNAL_IP${NC}"
echo ""

# Step 12: Create firewall rules
echo -e "${YELLOW}[12/15]${NC} Creating firewall rules..."
gcloud compute firewall-rules create allow-creditrisk-web \
  --allow=tcp:22,tcp:80,tcp:443,tcp:3000,tcp:8080 \
  --source-ranges=0.0.0.0/0 \
  2>/dev/null || echo -e "${YELLOW}⚠ Firewall rule may already exist${NC}"

gcloud sql instances patch $DB_INSTANCE \
  --allowed-networks=$VM_INTERNAL_IP/32 \
  2>/dev/null || echo -e "${YELLOW}⚠ Network allowlist may already be updated${NC}"
echo -e "${GREEN}✓ Firewall configured${NC}"
echo ""

# Step 13: Prepare VM deployment script
echo -e "${YELLOW}[13/15]${NC} Creating deployment script on VM..."

# Create the deployment script that will run on the VM
cat > /tmp/vm-deploy.sh << 'VMSCRIPT'
#!/bin/bash
set -e

# Replace placeholders with actual values
CLOUD_SQL_IP="__CLOUD_SQL_IP__"
APP_DB_PASSWORD="__APP_DB_PASSWORD__"
JWT_SECRET="__JWT_SECRET__"
VM_EXTERNAL_IP="__VM_EXTERNAL_IP__"

echo "🚀 Starting CreditRisk AI deployment on VM..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "📦 Installing Docker..."
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu

# Install tools
sudo apt install -y git openssl curl nano

# Clone repository
echo "📥 Cloning CreditRisk AI repository..."
sudo mkdir -p /opt/creditrisk
sudo chown ubuntu /opt/creditrisk
cd /opt/creditrisk
git clone https://github.com/Sparkydev007/creditrisk-ai.git .

# Create .env file
echo "⚙️  Creating environment configuration..."
cat > .env << ENVEOF
DATABASE_HOST=$CLOUD_SQL_IP
DATABASE_PORT=5432
DATABASE_NAME=creditrisk
DATABASE_USERNAME=creditrisk-user
DATABASE_PASSWORD=$APP_DB_PASSWORD

JWT_SECRET=$JWT_SECRET
JWT_EXPIRATION_MS=86400000

KAFKA_BOOTSTRAP_SERVERS=kafka:29092
KAFKA_TOPIC_APPLICATION_EVENTS=application-events
KAFKA_TOPIC_RISK_EVENTS=risk-events
KAFKA_TOPIC_DECISION_EVENTS=decision-events
KAFKA_TOPIC_AUDIT_EVENTS=audit-events

CUSTOMER_SERVICE_URL=http://customer-service:8081
APPLICATION_SERVICE_URL=http://application-service:8082
RISK_SERVICE_URL=http://risk-service:8083
DECISION_SERVICE_URL=http://decision-service:8084
AUDIT_SERVICE_URL=http://audit-service:8085
ML_SERVICE_URL=http://ml-service:8001

VITE_API_URL=http://$VM_EXTERNAL_IP:8080
CORS_ORIGINS=http://$VM_EXTERNAL_IP:3000,http://$VM_EXTERNAL_IP:8080

JAVA_TOOL_OPTIONS=-Xms128m -Xmx256m -XX:+UseSerialGC -XX:MaxRAMPercentage=60.0
SPRING_PROFILES_ACTIVE=gcp
ENVEOF

# Create docker-compose override (use Cloud SQL instead of local postgres)
echo "🐳 Creating Docker Compose configuration..."
cat > docker-compose.override.yml << 'OVERRIDEEOF'
version: '3.8'

services:
  postgres:
    profiles: ["never"]

  prometheus:
    profiles: ["disabled"]

  grafana:
    profiles: ["disabled"]

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

# Start services
echo "🚀 Starting Docker Compose services..."
docker compose --profile app up -d --build

echo "✅ Deployment complete!"
echo ""
echo "📊 Services starting up (this takes 10-20 minutes on first build)..."
echo "   Monitor with: docker compose logs -f api-gateway"
echo ""
echo "🌐 Once ready, access the application:"
echo "   Frontend: http://$VM_EXTERNAL_IP:3000"
echo "   API: http://$VM_EXTERNAL_IP:8080"
echo "   Swagger: http://$VM_EXTERNAL_IP:8081/swagger-ui.html"
echo ""
echo "👤 Demo credentials:"
echo "   Email: admin@creditrisk.com"
echo "   Password: password"
VMSCRIPT

# Replace placeholders
sed -i "s|__CLOUD_SQL_IP__|$CLOUD_SQL_IP|g" /tmp/vm-deploy.sh
sed -i "s|__APP_DB_PASSWORD__|$APP_DB_PASSWORD|g" /tmp/vm-deploy.sh
sed -i "s|__JWT_SECRET__|$JWT_SECRET|g" /tmp/vm-deploy.sh
sed -i "s|__VM_EXTERNAL_IP__|$VM_EXTERNAL_IP|g" /tmp/vm-deploy.sh

echo -e "${GREEN}✓ Deployment script prepared${NC}"
echo ""

# Step 14: Copy script to VM
echo -e "${YELLOW}[14/15]${NC} Uploading deployment script to VM..."
gcloud compute scp /tmp/vm-deploy.sh ubuntu@$VM_NAME:/tmp/vm-deploy.sh \
  --zone=$GCP_ZONE \
  --ssh-key-file=$SSH_KEY_PATH
chmod +x /tmp/vm-deploy.sh
echo -e "${GREEN}✓ Script uploaded${NC}"
echo ""

# Step 15: Execute deployment on VM
echo -e "${YELLOW}[15/15]${NC} Executing deployment on VM (this will take 15-25 minutes)..."
echo -e "${YELLOW}⏳ Docker images are building in the background...${NC}"
gcloud compute ssh ubuntu@$VM_NAME \
  --zone=$GCP_ZONE \
  --ssh-key-file=$SSH_KEY_PATH \
  --command="bash /tmp/vm-deploy.sh"

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ CreditRisk AI deployed successfully!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}📊 Deployment Summary:${NC}"
echo "   GCP Project: $GCP_PROJECT_ID"
echo "   VM: $VM_NAME ($VM_EXTERNAL_IP)"
echo "   Database: Cloud SQL ($CLOUD_SQL_IP)"
echo "   Region: $GCP_REGION"
echo ""
echo -e "${GREEN}🌐 Access the application:${NC}"
echo "   Frontend:     http://$VM_EXTERNAL_IP:3000"
echo "   API Gateway:  http://$VM_EXTERNAL_IP:8080"
echo "   Swagger UI:   http://$VM_EXTERNAL_IP:8081/swagger-ui.html"
echo ""
echo -e "${GREEN}👤 Demo Credentials:${NC}"
echo "   Email:    admin@creditrisk.com"
echo "   Password: password"
echo ""
echo -e "${GREEN}💾 Saved Credentials:${NC}"
echo "   Cloud SQL Root:    $ROOT_PASSWORD"
echo "   App DB Password:   $APP_DB_PASSWORD"
echo "   JWT Secret:        $JWT_SECRET"
echo ""
echo -e "${YELLOW}📝 To view logs on the VM:${NC}"
echo "   gcloud compute ssh ubuntu@$VM_NAME --zone=$GCP_ZONE"
echo "   cd /opt/creditrisk"
echo "   docker compose logs -f api-gateway"
echo ""
echo -e "${YELLOW}💰 Verify costs (should be $0):${NC}"
echo "   GCP Console → Billing → Active projects"
echo ""
echo -e "${YELLOW}🧹 To delete everything (when done):${NC}"
echo "   gcloud compute instances delete $VM_NAME --zone=$GCP_ZONE"
echo "   gcloud sql instances delete $DB_INSTANCE"
echo "   gcloud compute firewall-rules delete allow-creditrisk-web"
echo ""
