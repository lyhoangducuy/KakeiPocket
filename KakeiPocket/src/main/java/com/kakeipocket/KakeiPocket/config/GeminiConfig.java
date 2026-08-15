package com.kakeipocket.KakeiPocket.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

@Configuration
public class GeminiConfig {

    @Bean
    @ConfigurationProperties(prefix = "gemini")
    public GeminiProperties geminiProperties() {
        return new GeminiProperties();
    }

    @Bean(name = "geminiRestClient")
    public RestClient geminiRestClient(GeminiProperties props) {
        SimpleClientHttpRequestFactory factory =
                new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(
                (int) Duration.ofSeconds(props.getTimeoutSeconds())
                        .toMillis()
        );
        factory.setReadTimeout(
                (int) Duration.ofSeconds(props.getTimeoutSeconds())
                        .toMillis()
        );
        return RestClient.builder()
                .requestFactory(factory)
                .build();
    }

    public static class GeminiProperties {
        private String apiKey = "";
        private String model = "gemini-3.6-flash";
        private String baseUrl = "https://generativelanguage.googleapis.com/v1beta";
        private int timeoutSeconds = 25;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public String getBaseUrl() {
            return baseUrl;
        }

        public void setBaseUrl(String baseUrl) {
            this.baseUrl = baseUrl;
        }

        public int getTimeoutSeconds() {
            return timeoutSeconds;
        }

        public void setTimeoutSeconds(int timeoutSeconds) {
            this.timeoutSeconds = timeoutSeconds;
        }
    }
}