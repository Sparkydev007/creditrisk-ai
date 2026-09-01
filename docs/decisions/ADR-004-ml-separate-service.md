# ADR-004: ML as Separate Service

## Status
Accepted

## Context
The platform needs ML-based credit risk prediction. The ML stack (Python, scikit-learn) differs from the Java/Spring Boot backend.

## Decision
Implement ML as a separate Python FastAPI service:
- Java risk service calls ML service synchronously for predictions
- ML service has its own model training pipeline
- Graceful fallback to rule-based prediction when ML is unavailable

## Alternatives Considered
1. **Embedded ML in Java**: Libraries like Tribuo, but less ML ecosystem support
2. **Batch ML pipeline**: Better for large datasets, not real-time decisions
3. **Cloud ML service**: AWS SageMaker adds cost and vendor lock-in

## Consequences
### Positive
- Python ML ecosystem access (scikit-learn, pandas)
- Independent model deployment and updates
- Can scale ML independently
- Model versioning and A/B testing possible

### Negative
- Network call adds latency
- Another service to deploy and monitor
- Model serving infrastructure needed

## Resilience
- 5-second timeout on ML calls
- Automatic fallback to rule-based prediction
- Circuit breaker pattern available
- ML failure → MANUAL_REVIEW (never auto-approve)
