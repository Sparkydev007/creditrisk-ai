package com.creditrisk.decision;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@ComponentScan(basePackages = {"com.creditrisk"})
@EnableAsync
public class DecisionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(DecisionServiceApplication.class, args);
    }
}
