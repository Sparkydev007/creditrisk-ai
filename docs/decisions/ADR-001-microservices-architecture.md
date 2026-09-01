# ADR-001: Microservices Architecture

## Status
Accepted

## Context
CreditRisk AI requires a scalable, maintainable architecture that separates concerns across different business domains (customers, applications, risk, decisions, audit).

## Decision
Adopt a microservices architecture with clearly bounded service contexts:
- **Customer Service**: Authentication, customer profiles
- **Application Service**: Credit application lifecycle
- **Risk Service**: Feature calculation, ML integration
- **Decision Service**: Business rules, decision engine
- **Audit Service**: Event consumption, audit trail

## Alternatives Considered
1. **Monolith**: Simpler initially, but harder to scale and separate concerns
2. **Modular Monolith**: Better separation but still single deployment unit
3. **Serverless**: Good for event-driven, but adds complexity for stateful operations

## Consequences
### Positive
- Independent deployment and scaling
- Technology flexibility per service
- Clear ownership boundaries
- Fault isolation

### Negative
- Increased operational complexity
- Network latency between services
- Distributed transactions require careful design
- More infrastructure to manage

## Justification
Financial systems benefit from clear separation of concerns and audit boundaries. Microservices allow the risk engine to scale independently and the ML service to use Python while the core platform uses Java.
