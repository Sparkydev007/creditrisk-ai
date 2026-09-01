# System Architecture

## Overview

CreditRisk AI is a microservices-based platform for credit decisioning and risk assessment. The system follows an event-driven architecture with clear service boundaries.

## Service Responsibilities

### API Gateway (Spring Cloud Gateway)
- Single public entry point
- Request routing to downstream services
- CORS configuration
- Rate limiting

### Customer Service
- User authentication and JWT token management
- Customer registration and profile management
- Employment and financial profile storage
- Role-based access control (ADMIN, ANALYST, CUSTOMER)

### Application Service
- Credit application CRUD operations
- Application lifecycle management (DRAFT → SUBMITTED → UNDER_REVIEW → DECISION)
- Dashboard statistics aggregation
- Integration with Risk and Decision services via events

### Risk Service
- Financial feature calculation (DTI, LTI, credit utilization)
- ML model integration via HTTP client
- Risk score generation (300-850 scale)
- Risk categorization (LOW, MEDIUM, HIGH)
- Explainable risk factor generation

### Decision Service
- Business rule evaluation
- Configurable policy management
- Decision outcome generation (APPROVE, MANUAL_REVIEW, REJECT)
- Decision explanation generation

### Audit Service
- Kafka event consumption
- Audit trail creation and querying
- Compliance event logging

### ML Service (Python FastAPI)
- Credit risk prediction model serving
- Rule-based fallback prediction
- Model health monitoring

## Data Flow

```
1. Customer registers → Customer Service → PostgreSQL
2. Application created → Application Service → PostgreSQL
3. Application submitted → Kafka event → Risk Service
4. Risk Service calculates features → Calls ML Service
5. ML Service returns probability → Risk Service saves assessment
6. Risk assessment completed → Kafka event → Decision Service
7. Decision Service applies rules → Generates decision
8. Decision generated → Kafka event → Audit Service
9. All events → Audit Service → Audit trail
```

## Database Architecture

Each service owns its database:
- **Customer Service**: users, customers tables
- **Application Service**: credit_applications, risk_assessments, decisions, decision_rules
- **Risk Service**: risk_assessment_data, risk_assessment_records
- **Decision Service**: decision_policies, decision_records
- **Audit Service**: audit_logs

## Security Architecture

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with BCrypt
- CORS configuration per service
- No secrets in codebase

## Observability

- Spring Actuator endpoints for health and metrics
- Prometheus metrics collection
- Grafana dashboards
- Structured logging with correlation IDs

## Deployment

### Local
- Docker Compose with all services
- PostgreSQL, Kafka, Zookeeper included

### Cloud (AWS)
- ECS Fargate for container orchestration
- RDS PostgreSQL for database
- ALB for load balancing
- CloudWatch for logging
- VPC with public/private subnets
