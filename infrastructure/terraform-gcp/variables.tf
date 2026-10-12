variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region for all resources"
  type        = string
  default     = "europe-west1"
}

variable "db_tier" {
  description = "Cloud SQL instance tier (db-f1-micro is the cheapest shared-core tier)"
  type        = string
  default     = "db-f1-micro"
}

variable "db_password" {
  description = "Password for the creditrisk Cloud SQL user (sensitive)"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret used by all services (sensitive)"
  type        = string
  sensitive   = true
}

variable "cors_origins" {
  description = "Comma-separated origins allowed by the API gateway"
  type        = string
  default     = "*"
}

variable "artifact_repo" {
  description = "Artifact Registry docker repository name"
  type        = string
  default     = "creditrisk"
}

variable "labels" {
  description = "Labels applied to all resources"
  type        = map(string)
  default = {
    app     = "creditrisk-ai"
    managed = "terraform"
  }
}
