# ------------------------------------------------------------------
# CreditRisk AI — GCP infrastructure
#
# Provisions everything the Cloud Run deployment needs:
#   - Enabled service APIs
#   - Artifact Registry docker repo
#   - Cloud SQL PostgreSQL (4 databases) + user
#   - Service account for Cloud Run + IAM bindings
#   - Secret Manager entries (db password, JWT, Kafka placeholder)
#
# Usage:
#   terraform init
#   terraform plan  -var project_id=YOUR_PROJECT -var db_password=... -var jwt_secret=...
#   terraform apply -var project_id=YOUR_PROJECT -var db_password=... -var jwt_secret=...
# ------------------------------------------------------------------

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.30"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ------------------------------------------------------------------
# APIs
# ------------------------------------------------------------------
resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "cloudbuild.googleapis.com",
    "iam.googleapis.com",
    "cloudtrace.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com",
  ])
  service            = each.value
  disable_on_destroy = false
}

# ------------------------------------------------------------------
# Artifact Registry
# ------------------------------------------------------------------
resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = var.artifact_repo
  description   = "CreditRisk AI container images"
  format        = "DOCKER"

  depends_on = [google_project_service.apis]
}

# ------------------------------------------------------------------
# Cloud SQL PostgreSQL
# ------------------------------------------------------------------
resource "google_sql_database_instance" "postgres" {
  name             = "creditrisk"
  database_version = "POSTGRES_16"
  region           = var.region
  deletion_protection = false # flip to true for prod

  settings {
    tier              = var.db_tier
    availability_type = "ZONAL"
    disk_autoresize   = true

    ip_configuration {
      # Private IP only if you set up VPC; keep public + authorized nets=0
      ipv4_enabled = true
      authorized_networks {
        value           = "0.0.0.0/0"
        name            = "allow-all (restrict in prod)"
      }
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      backup_start_time              = "03:00"
    }

    database_flags {
      name  = "max_connections"
      value = "100"
    }
  }

  depends_on = [google_project_service.apis]
}

resource "google_sql_database" "dbs" {
  for_each = toset([
    "creditrisk",          # customer-service
    "creditrisk_app",      # application-service
    "creditrisk_risk",     # risk-service
    "creditrisk_decision", # decision-service
    "creditrisk_audit",    # audit-service
  ])
  name     = each.value
  instance = google_sql_database_instance.postgres.name
}

resource "google_sql_user" "creditrisk" {
  name     = "creditrisk"
  instance = google_sql_database_instance.postgres.name
  password = var.db_password
}

# Store the Cloud SQL connection name so services can use the Cloud SQL connector
output "cloudsql_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

# ------------------------------------------------------------------
# Service Account for Cloud Run services
# ------------------------------------------------------------------
resource "google_service_account" "cloudrun" {
  account_id   = "creditrisk-run"
  display_name = "CreditRisk Cloud Run runtime"
}

# Cloud SQL Client (via Cloud SQL connector / metadata)
resource "google_project_iam_member" "run_sql_client" {
  project = var.project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Pull images from Artifact Registry
resource "google_project_iam_member" "run_artifact_reader" {
  project = var.project_id
  role    = "roles/artifactregistry.reader"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Read secrets from Secret Manager
resource "google_project_iam_member" "run_secret_accessor" {
  project = var.project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# Write logs/metrics
resource "google_project_iam_member" "run_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.cloudrun.email}"
}

# ------------------------------------------------------------------
# Secret Manager entries
# ------------------------------------------------------------------
resource "google_secret_manager_secret" "db_password" {
  secret_id = "creditrisk-db-password"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

resource "google_secret_manager_secret" "jwt" {
  secret_id = "creditrisk-jwt-secret"
  replication {
    auto {}
  }
}

resource "google_secret_manager_secret_version" "jwt" {
  secret      = google_secret_manager_secret.jwt.id
  secret_data = var.jwt_secret
}

# ------------------------------------------------------------------
# Cloud Run services are NOT managed by this Terraform root.
# The per-service manifests live in ../cloudrun/*.service.yaml and are
# deployed with `gcloud run services replace` by .github/workflows/deploy-gcp.yml
# (see docs/deployment/gcp-deployment.md). Terraform provisions everything
# those manifests depend on Cloud SQL + IAM + secrets.
#
# Render the manifests locally with:
#   ./scripts/render-gcp-manifests.sh <project-id> <region> <repo>
# ------------------------------------------------------------------

# ------------------------------------------------------------------
# Outputs
# ------------------------------------------------------------------
output "artifact_registry_url" {
  value = "${var.region}-docker.pkg.dev/${var.project_id}/${var.artifact_repo}"
}

output "cloudsql_instance_connection_name" {
  value = google_sql_database_instance.postgres.connection_name
}

output "cloudsql_public_ip" {
  value = google_sql_database_instance.postgres.public_ip_address
}

output "cloudrun_sa_email" {
  value = google_service_account.cloudrun.email
}

output "jwt_secret_id" {
  value = google_secret_manager_secret.jwt.secret_id
}
