<div align="center">

# 🏦 CreditRisk AI

### Enterprise Credit Decisioning & Risk Assessment Platform

**AI-assisted credit risk assessment powered by scalable Java microservices.**

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Kafka](https://img.shields.io/badge/Apache_Kafka-7.5-231F20?style=for-the-badge&logo=apachekafka&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-24-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Terraform](https://img.shields.io/badge/Terraform-1.6-7B42BC?style=for-the-badge&logo=terraform&logoColor=white)

[![CI](https://github.com/prathmesh-bunde/creditrisk-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/prathmesh-bunde/creditrisk-ai/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[**🔗 Live Demo**](https://frontend-nine-nu-np4asmffc0.vercel.app) · [**📖 Architecture Docs**](docs/architecture/system-architecture.md) · [**📐 ADRs**](docs/decisions/)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Microservices](#microservices)
- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [ML Pipeline](#ml-pipeline)
- [Decision Engine](#decision-engine)
- [Event-Driven Architecture](#event-driven-architecture)
- [Frontend](#frontend)
- [Deployment](#deployment)
- [Observability](#observability)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Design Decisions](#design-decisions)
- [Responsible AI](#responsible-ai)
- [Trade-offs](#trade-offs)
- [Future Improvements](#future-improvements)

---

## Overview

**CreditRisk AI** is a production-style enterprise platform that simulates a financial institution's credit application and risk assessment workflow. It demonstrates microservices architecture, event-driven communication, machine learning integration, and enterprise-grade engineering practices.

### What It Does

```
Customer registers → Creates credit application → Application submitted
    → Risk features calculated → ML model predicts default probability
    → Business rules evaluated → Decision generated (APPROVE / REVIEW / REJECT)
    → Explainable AI summary produced → Full audit trail recorded
```

### Key Capabilities

| Capability | Implementation |
|-----------|---------------|
| **Authentication** | JWT tokens, BCrypt password hashing, RBAC (ADMIN/ANALYST/CUSTOMER) |
| **Microservices** | 6 Java Spring Boot services + 1 API Gateway |
| **Machine Learning** | Python FastAPI service with scikit-learn models |
| **Event-Driven** | Apache Kafka with domain events and outbox pattern |
| **Database** | PostgreSQL with Flyway migrations and proper indexing |
| **Frontend** | React 18 with Bootstrap 5, Recharts, Vite |
| **CI/CD** | GitHub Actions with build, test, and Docker pipeline |
| **Infrastructure** | Terraform for AWS (VPC, RDS, ECS, ALB) |
| **Observability** | Prometheus, Grafana, Spring Actuator, structured logging |

> ⚠️ **Disclaimer:** This is an educational simulation system. It is **NOT** suitable for real-world credit underwriting without extensive validation, governance, compliance, and human oversight.

---

## Architecture

```
                            ┌─────────────────────────┐
                            │      React Frontend      │
                            │    Bootstrap + Recharts   │
                            └────────────┬────────────┘
                                         │
                            ┌────────────▼────────────┐
                            │      API Gateway         │
                            │   Spring Cloud Gateway    │
                            └────────────┬────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
    ┌─────────▼─────────┐    ┌──────────▼──────────┐    ┌─────────▼─────────┐
    │  Customer Service  │    │ Application Service  │    │   Audit Service   │
    │   Port: 8081       │    │    Port: 8082        │    │   Port: 8085      │
    │  ┌──────────────┐  │    │  ┌───────────────┐  │    │  ┌─────────────┐  │
    │  │  JWT Auth     │  │    │  │ App Lifecycle  │  │    │  │ Event Log   │  │
    │  │  User Mgmt    │  │    │  │ Dashboard      │  │    │  │ Audit Trail │  │
    │  └──────────────┘  │    │  └───────────────┘  │    │  └─────────────┘  │
    └─────────┬─────────┘    └──────────┬──────────┘    └─────────┬─────────┘
              │                         │                         │
    ┌─────────▼─────────┐    ┌──────────▼──────────┐    ┌─────────▼─────────┐
    │    PostgreSQL      │    │     Kafka Events     │    │    PostgreSQL      │
    │    (creditrisk)    │    │  application-events  │    │  (creditrisk_audit)│
    └───────────────────┘    │  risk-events          │    └───────────────────┘
                             │  decision-events      │
                             └──────────┬──────────┘
                                        │
                             ┌──────────▼──────────┐
                             │    Risk Service      │
                             │     Port: 8083       │
                             │  ┌────────────────┐  │
                             │  │ Feature Calc    │  │
                             │  │ Risk Scoring    │  │
                             │  └────────────────┘  │
                             └──────────┬──────────┘
                                        │ HTTP
                             ┌──────────▼──────────┐
                             │    ML Service        │
                             │  Python FastAPI:8001 │
                             │  scikit-learn model  │
                             └─────────────────────┘
                                        │ Kafka
                             ┌──────────▼──────────┐
                             │  Decision Service    │
                             │     Port: 8084       │
                             │  ┌────────────────┐  │
                             │  │ Business Rules  │  │
                             │  │ Policy Config   │  │
                             │  └────────────────┘  │
                             └─────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 21 LTS | Primary backend language |
| Spring Boot | 3.2.0 | Microservice framework |
| Spring Security | 6.x | Authentication & authorization |
| Spring Data JPA | 3.x | Database access |
| Spring Cloud Gateway | 4.1 | API Gateway |
| Maven | 3.9 | Build tool |
| Lombok | 1.18 | Boilerplate reduction |

### Data
| Technology | Version | Purpose |
|-----------|---------|---------|
| PostgreSQL | 16 | Primary database |
| Flyway | 9.x | Database migrations |
| Apache Kafka | 7.5 | Event streaming |

### ML/AI
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11 | ML service runtime |
| FastAPI | 0.104 | ML API framework |
| scikit-learn | 1.3 | ML model training |
| pandas | 2.1 | Data processing |
| NumPy | 1.26 | Numerical computation |

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.8 | Type safety |
| Vite | 6.0 | Build tool |
| Tailwind CSS | 4.1 | Styling |
| Axios | 1.7 | HTTP client |
| Lucide / Material Symbols | - | Iconography |

### DevOps
| Technology | Version | Purpose |
|-----------|---------|---------|
| Docker | 24.x | Containerization |
| Docker Compose | 3.8 | Local orchestration |
| GitHub Actions | - | CI/CD pipeline |
| Terraform | 1.6 | Infrastructure as Code |
| Prometheus | 2.48 | Metrics collection |
| Grafana | 10.2 | Metrics visualization |

---

## Microservices

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **API Gateway** | 8080 | - | Single entry point, routing, CORS |
| **Customer Service** | 8081 | creditrisk | Authentication, customer profiles, RBAC |
| **Application Service** | 8082 | creditrisk_app | Credit application lifecycle, dashboard |
| **Risk Service** | 8083 | creditrisk_risk | Feature calculation, ML integration |
| **Decision Service** | 8084 | creditrisk_decision | Business rules, configurable policies |
| **Audit Service** | 8085 | creditrisk_audit | Event consumption, compliance trail |
| **ML Service** | 8001 | - | Python FastAPI prediction service |

### Service Communication

```
Synchronous (REST):
  Frontend → API Gateway → Backend Services
  Risk Service → ML Service (prediction)

Asynchronous (Kafka):
  Application Service → "ApplicationSubmitted" → Risk Service
  Risk Service → "RiskAssessmentCompleted" → Decision Service
  Decision Service → "DecisionGenerated" → Audit Service
  All Services → Domain Events → Audit Service
```

---

## Quick Start

### Prerequisites

- **Docker & Docker Compose** (recommended)
- **Java 21** (for local development)
- **Python 3.11+** (for ML training)
- **Node.js 20+** (for frontend development)

### Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/prathmesh-bunde/creditrisk-ai.git
cd creditrisk-ai

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up --build

# Access the platform
# Frontend:      http://localhost:3000
# API Gateway:   http://localhost:8080
# Swagger UI:    http://localhost:8081/swagger-ui.html
# Grafana:       http://localhost:3001 (admin/admin)
# Prometheus:    http://localhost:9090
```

### Local Development

```bash
# 1. Start infrastructure
docker compose up postgres kafka zookeeper -d

# 2. Train ML model
cd ml-service
pip install -r requirements.txt
python training/train_model.py
cd ..

# 3. Start backend services (in separate terminals)
cd services/customer-service && mvn spring-boot:run
cd services/application-service && mvn spring-boot:run
cd services/risk-service && mvn spring-boot:run
cd services/decision-service && mvn spring-boot:run
cd services/audit-service && mvn spring-boot:run
cd services/api-gateway && mvn spring-boot:run

# 4. Start frontend
cd frontend
npm install
npm run dev
```

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@creditrisk.com | password |
| Analyst | analyst@creditrisk.com | password |

---

## API Endpoints

### Authentication
```http
POST /api/auth/register     # Register new user
POST /api/auth/login        # Login and get JWT token
```

### Customers
```http
GET    /api/customers           # List customers (paginated, searchable)
GET    /api/customers/{id}      # Get customer details
POST   /api/customers           # Create customer
PUT    /api/customers/{id}      # Update customer
DELETE /api/customers/{id}      # Deactivate customer
```

### Applications
```http
GET    /api/applications                # List applications
GET    /api/applications/{id}           # Get application with risk + decision
POST   /api/applications               # Create application
POST   /api/applications/{id}/submit   # Submit for review
GET    /api/applications/customer/{id}  # Get by customer
GET    /api/applications/dashboard/stats # Dashboard statistics
```

### Risk Assessment
```http
POST /api/risk/assess/{applicationId}      # Trigger risk assessment
GET  /api/risk/assessment/{applicationId}   # Get assessment result
```

### Decisions
```http
GET  /api/decisions/{applicationId}         # Get decision
POST /api/decisions/process/{applicationId}  # Process decision manually
GET  /api/decisions/policies                 # Get decision policies
PUT  /api/decisions/policies/{id}            # Update policy
```

### Audit
```http
GET /api/audit                         # List audit logs
GET /api/audit/{entityType}/{entityId} # Get entity audit trail
```

---

## ML Pipeline

### Model Training

The ML service trains on synthetic credit data with realistic distributions:

```bash
cd ml-service
python training/train_model.py
```

**Models Trained:**

| Model | ROC-AUC | Precision | Recall | F1-Score |
|-------|---------|-----------|--------|----------|
| Logistic Regression | 0.6855 | 0.5902 | 0.1003 | 0.1714 |
| Random Forest | 0.6731 | 0.6377 | 0.1226 | 0.2056 |
| Gradient Boosting | 0.6782 | 0.5472 | 0.1616 | 0.2495 |

**Best Model:** Logistic Regression (selected by ROC-AUC)

### Features Used

| Feature | Description | Type |
|---------|-------------|------|
| `income` | Annual income | Numeric |
| `loan_amount` | Requested loan amount | Numeric |
| `employment_years` | Years at current job | Numeric |
| `credit_utilization` | Credit card utilization (0-1) | Numeric |
| `payment_history_score` | Payment history score (0-1) | Numeric |
| `existing_debt` | Total existing debt | Numeric |
| `recent_inquiries` | Recent credit inquiries | Numeric |

### Prediction API

```bash
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d '{
    "income": 850000,
    "loan_amount": 300000,
    "employment_years": 5,
    "credit_utilization": 0.28,
    "payment_history_score": 0.91,
    "existing_debt": 120000,
    "recent_inquiries": 2
  }'
```

**Response:**
```json
{
  "probability_of_default": 0.0386,
  "model_version": "v1.0-trained",
  "confidence": 0.85
}
```

### Resilience

If the ML service is unavailable, the system automatically falls back to a **rule-based prediction** and routes the application to **MANUAL_REVIEW** — it never auto-approves when the model is down.

---

## Decision Engine

The decision engine combines ML predictions with configurable business rules:

### Default Policy

```json
{
  "minCreditScore": 650,
  "maxDti": 0.43,
  "approveProbabilityThreshold": 0.05,
  "manualReviewProbabilityThreshold": 0.15,
  "maxLoanToIncomeRatio": 5.0
}
```

### Decision Logic

```
IF    probability_of_default < 5%  AND  credit_score ≥ 650  AND  DTI ≤ 43%
THEN  → APPROVE

IF    probability_of_default > 15%  OR  credit_score < 650  OR  DTI > 43%
THEN  → REJECT

ELSE  → MANUAL_REVIEW
```

### Explainable Output

Every decision includes a structured explanation:

```
Decision: APPROVE

Positive Factors:
✓ Strong credit score (742)
✓ Low debt-to-income ratio (28.5%)
✓ Very low default probability (3.9%)
✓ Reasonable loan-to-income ratio (2.1x)

Risk Factors:
⚠ Two recent credit inquiries

Model:
Default probability = 3.9%
Risk score = 742
```

---

## Event-Driven Architecture

### Domain Events

| Event | Producer | Consumer | Trigger |
|-------|----------|----------|---------|
| `ApplicationSubmitted` | Application Service | Risk Service | Customer submits application |
| `RiskAssessmentCompleted` | Risk Service | Decision Service | ML prediction received |
| `ApplicationApproved` | Decision Service | Audit Service | Decision = APPROVE |
| `ApplicationRejected` | Decision Service | Audit Service | Decision = REJECT |
| `ApplicationUnderReview` | Decision Service | Audit Service | Decision = MANUAL_REVIEW |
| `RiskAssessmentFailed` | Risk Service | Audit Service | ML service unavailable |

### Event Schema

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "eventType": "ApplicationSubmitted",
  "aggregateId": "1024",
  "aggregateType": "CreditApplication",
  "timestamp": "2026-09-01T10:30:00Z",
  "correlationId": "req-abc-123",
  "payload": "{\"applicationId\": 1024, \"customerId\": 42}"
}
```

### Why Kafka?

| Consideration | Decision |
|--------------|----------|
| **Async processing** | Risk assessment takes time; don't block the user |
| **Fault isolation** | ML failure doesn't crash the application service |
| **Event replay** | Can reprocess events for debugging or rebuilding state |
| **Audit trail** | Natural log of all system events |

---

## Frontend

Enterprise decisioning UI (React 19 + Tailwind v4) with a JWT login gate, a LIVE/DEMO data indicator, and automatic fallback to demo data when the backend is unreachable.

### Screens

| Screen | Description |
|-------|-------------|
| Login | JWT authentication (demo accounts work offline too) |
| Dashboard | Portfolio KPIs, pipeline charts, quick actions |
| Applications | List + full detail view with risk factors, rationale, timeline, decision override |
| Review Queue | MANUAL_REVIEW applications with priority filtering |
| Customers | Customer list with exposure and risk grades |
| Risk Analytics | Portfolio stress-testing view |
| Audit | Live audit trail from the audit service (mock data in demo mode) |
| Policy Config | Decision policy thresholds |
| System Health | Per-service health probes via the gateway |

### Live Demo

🔗 **https://frontend-nine-nu-np4asmffc0.vercel.app**

### Screenshots

**Dashboard** — Application statistics with Recharts visualizations
**Application Detail** — Risk score, ML prediction, decision, and audit timeline
**Audit Log** — Filterable event trail across all services

---

## Deployment

### Level 0: Free cloud — $0/month (recommended)

Full production-style deployment on an Oracle Cloud Always Free ARM VM (2 OCPU / 12 GB) — all services, Kafka, PostgreSQL, HTTPS.

📘 **[Follow the Free Cloud Deployment Guide](docs/deployment/free-cloud-deployment.md)**

CI/CD included: `.github/workflows/cd.yml` builds all 8 images to GHCR and can auto-deploy over SSH on every push to `main`.

### Level 1: Local (Docker Compose)

```bash
cp .env.example .env
docker compose --profile app up --build          # app stack

docker compose --profile app --profile monitoring up -d   # + Prometheus/Grafana
```

### Level 2: Cloud (AWS via Terraform)

```bash
cd infrastructure/terraform
terraform init
terraform plan -var="db_password=YOUR_PASSWORD" -var="jwt_secret=YOUR_SECRET"
terraform apply -var="db_password=YOUR_PASSWORD" -var="jwt_secret=YOUR_SECRET"
```

**AWS Architecture:**
```
CloudFront / S3  →  ALB  →  ECS Fargate (6 services)
                              ↓
                         RDS PostgreSQL
                              ↓
                         CloudWatch Logs
```

### Level 3: Frontend (Vercel)

```bash
cd frontend
vercel --yes --prod
```

---

## Observability

### Endpoints

| Endpoint | Service | Purpose |
|----------|---------|---------|
| `/actuator/health` | All services | Health checks |
| `/actuator/prometheus` | All services | Prometheus metrics |
| `/actuator/info` | All services | Service info |

### Metrics Collected

- **Request rate** and **latency** per service
- **Error rate** and **status code distribution**
- **JVM metrics** (heap, GC, threads)
- **Database connection pool** metrics
- **Kafka consumer lag**

### Grafana Dashboard

Pre-configured dashboards for:
- Service health status
- CPU and memory usage
- Request rate and latency
- Error rate trends

---

## Testing

### ML Tests

```bash
cd ml-service
python -m pytest tests/ -v
```

**Results:** 7/7 tests passing

| Test | Description |
|------|-------------|
| `test_low_risk` | Low-risk applicant produces low POD |
| `test_high_risk` | High-risk applicant produces high POD |
| `test_income_factor` | Higher income → lower risk |
| `test_payment_history_factor` | Better history → lower risk |
| `test_bounds` | Prediction always in [0.01, 0.95] |
| `test_zero_income` | Edge case: minimal income |
| `test_creation` | Request model defaults work |

### Running All Tests

```bash
# Backend
mvn test

# ML
cd ml-service && python -m pytest tests/ -v

# Frontend
cd frontend && npm test
```

---

## Project Structure

```
creditrisk-ai/
├── frontend/                          # React frontend (Vite)
│   ├── src/
│   │   ├── pages/                     # Page components
│   │   ├── components/                # Shared components
│   │   └── api.js                     # API client
│   ├── vercel.json                    # Vercel config
│   └── vite.config.js                 # Vite config
│
├── services/
│   ├── common/                        # Shared Java module
│   │   └── src/main/java/com/creditrisk/
│   │       ├── common/config/         # Kafka config
│   │       ├── common/dto/            # Shared DTOs
│   │       ├── common/exception/      # Global exception handling
│   │       └── common/messaging/      # Event publisher
│   │
│   ├── api-gateway/                   # Spring Cloud Gateway
│   ├── customer-service/              # Auth + customer management
│   ├── application-service/           # Credit application lifecycle
│   ├── risk-service/                  # Risk assessment engine
│   ├── decision-service/              # Business rules + decisions
│   └── audit-service/                 # Audit trail
│
├── ml-service/                        # Python ML service
│   ├── app/main.py                    # FastAPI application
│   ├── training/train_model.py        # Model training pipeline
│   ├── models/                        # Trained model artifacts
│   └── tests/                         # ML tests
│
├── infrastructure/
│   ├── terraform/                     # AWS IaC
│   │   └── modules/                   # networking, database, compute
│   ├── prometheus/                    # Prometheus config
│   └── grafana/                       # Grafana dashboards
│
├── docs/
│   ├── architecture/                  # System architecture
│   ├── decisions/                     # ADRs
│   └── agile/                         # Backlog
│
├── .github/workflows/ci.yml          # GitHub Actions CI
├── docker-compose.yml                 # Full stack orchestration
├── .env.example                       # Environment template
├── pom.xml                            # Parent Maven POM
└── README.md
```

---

## Design Decisions

| ADR | Decision | Rationale |
|-----|----------|-----------|
| [ADR-001](docs/decisions/ADR-001-microservices-architecture.md) | Microservices | Clear service boundaries, independent scaling, fault isolation |
| [ADR-003](docs/decisions/ADR-003-kafka-event-architecture.md) | Kafka events | Async processing, loose coupling, event replay |
| [ADR-004](docs/decisions/ADR-004-ml-separate-service.md) | Separate ML service | Python ecosystem access, independent deployment |

---

## Responsible AI

### Limitations

- **Synthetic data only** — Model trained on generated data, not real lending data
- **No protected characteristics** — Race, gender, age are NOT used in decisions
- **Simulation system** — Not suitable for real credit underwriting
- **Human review required** — MANUAL_REVIEW route ensures human oversight

### Fairness Considerations

- Model uses only **financial features** (income, debt, payment history)
- No demographic data collected or used
- All decisions are **explainable** with structured reasoning
- Audit trail ensures **accountability**

### Monitoring

- Model versioning for **reproducibility**
- Prediction logging for **drift detection**
- Probability calibration tracking
- Human review for **edge cases**

---

## Trade-offs

| Decision | Chose | Alternative | Why |
|----------|-------|-------------|-----|
| Database per service | Separate DBs | Shared DB | Proper microservice isolation |
| Kafka vs REST | Kafka for events, REST for queries | All REST | Events are async; queries are sync |
| Rule-based fallback | Both ML + rules | ML only | System must work when ML is down |
| Monorepo | Single repo | Polyrepo | Simpler development and shared code |
| Vite vs CRA | Vite | Create React App | CRA deprecated; Vite is faster |

---

## Future Improvements

- [ ] Real-time notifications (WebSocket)
- [ ] Model monitoring dashboard (data drift detection)
- [ ] A/B testing for decision policies
- [ ] Selenium E2E tests
- [ ] Load testing with k6
- [ ] Kubernetes deployment manifests
- [ ] Redis caching layer
- [ ] Circuit breaker with Resilience4j
- [ ] OpenTelemetry distributed tracing

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## License

MIT License — See [LICENSE](LICENSE)

---

<div align="center">

**Built as a production-style portfolio project demonstrating enterprise Java, microservices, AI/ML, cloud, and DevOps engineering.**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/prathmesh-bunde)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/prathmesh-bunde)

</div>
