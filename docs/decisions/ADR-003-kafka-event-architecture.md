# ADR-003: Kafka Event Architecture

## Status
Accepted

## Context
The credit decisioning pipeline involves multiple sequential steps (application → risk assessment → decision) that need to be coordinated across services. Synchronous REST calls would create tight coupling and failure cascading.

## Decision
Use Apache Kafka for asynchronous event-driven communication between services:
- `application-events`: Application lifecycle events
- `risk-events`: Risk assessment events
- `decision-events`: Decision outcomes
- `audit-events`: Cross-cutting audit events

## Alternatives Considered
1. **Synchronous REST**: Simpler but creates tight coupling and cascading failures
2. **RabbitMQ**: Good for task queues, less suited for event streaming
3. **AWS SQS/SNS**: Cloud-native but adds vendor lock-in

## Consequences
### Positive
- Loose coupling between services
- Natural event replay capability
- Asynchronous processing improves resilience
- Built-in fault tolerance

### Negative
- Eventual consistency (not immediate)
- Debugging event flows is harder
- Kafka operational complexity

## Delivery Guarantees
- `at-least-once` delivery with idempotent consumers
- Outbox pattern for reliable event publishing
- Consumer group offsets for independent consumption

## Failure Handling
- ML service unavailable → Fallback to rule-based prediction → MANUAL_REVIEW
- Kafka unavailable → Events queued locally → Retry on reconnect
