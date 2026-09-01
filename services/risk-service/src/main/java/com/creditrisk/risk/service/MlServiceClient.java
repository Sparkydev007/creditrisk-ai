package com.creditrisk.risk.service;

import com.creditrisk.risk.dto.MlPredictionRequest;
import com.creditrisk.risk.dto.MlPredictionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Slf4j
@Component
public class MlServiceClient {

    @Value("${ml-service.url:http://localhost:8001}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate;

    public MlServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    public MlPredictionResponse predict(MlPredictionRequest request) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<MlPredictionRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<MlPredictionResponse> response = restTemplate.exchange(
                    mlServiceUrl + "/predict",
                    HttpMethod.POST,
                    entity,
                    MlPredictionResponse.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.info("ML prediction received for application {}: POD={}",
                        request.getApplicationId(), response.getBody().getProbabilityOfDefault());
                return response.getBody();
            }

            log.warn("ML service returned non-success status: {}", response.getStatusCode());
            return getFallbackPrediction(request);

        } catch (Exception e) {
            log.error("ML service unavailable: {}. Using fallback.", e.getMessage());
            return getFallbackPrediction(request);
        }
    }

    private MlPredictionResponse getFallbackPrediction(MlPredictionRequest request) {
        // Simple rule-based fallback when ML service is unavailable
        double score = 0.1;

        if (request.getIncome() > 0) {
            double dti = request.getExistingDebt() / request.getIncome();
            score += dti * 0.3;
        }
        if (request.getCreditUtilization() != null) {
            score += request.getCreditUtilization() * 0.2;
        }
        if (request.getPaymentHistoryScore() != null) {
            score -= request.getPaymentHistoryScore() * 0.2;
        }

        double pod = Math.max(0.01, Math.min(0.99, score));

        return MlPredictionResponse.builder()
                .probabilityOfDefault(pod)
                .modelVersion("fallback-v1.0")
                .confidence(0.5)
                .build();
    }
}
