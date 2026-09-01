package com.creditrisk.common.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void publish(String topic, DomainEvent event) {
        try {
            String payload = objectMapper.writeValueAsString(event);
            kafkaTemplate.send(topic, event.getAggregateId(), payload)
                    .whenComplete((result, ex) -> {
                        if (ex != null) {
                            log.error("Failed to publish event {} to topic {}: {}",
                                    event.getEventType(), topic, ex.getMessage());
                        } else {
                            log.info("Published event {} to topic {} for aggregate {}",
                                    event.getEventType(), topic, event.getAggregateId());
                        }
                    });
        } catch (Exception e) {
            log.error("Error serializing event {}: {}", event.getEventType(), e.getMessage());
        }
    }
}
