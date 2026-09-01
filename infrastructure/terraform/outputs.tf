output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.vpc_id
}

output "database_endpoint" {
  description = "RDS endpoint"
  value       = module.database.endpoint
  sensitive   = true
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS"
  value       = module.compute.alb_dns_name
}
