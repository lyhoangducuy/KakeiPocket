package com.kakeipocket.KakeiPocket.services.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.config.GeminiConfig.GeminiProperties;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiService {

    private final GeminiProperties properties;

    @Qualifier("geminiRestClient")
    private final RestClient restClient;

    private final ObjectMapper objectMapper;

    public String generateContent(
            String systemInstruction,
            String userPrompt
    ) {
        if (properties.getApiKey() == null
                || properties.getApiKey().isBlank()) {
            log.warn("Gemini API key is not configured");
            throw new AppException(ErrorCode.AI_SERVICE_UNAVAILABLE);
        }

        String url = properties.getBaseUrl()
                + "/models/" + properties.getModel()
                + ":generateContent";

        GeminiRequest body = GeminiRequest.builder()
                .systemInstruction(GeminiRequest.SystemInstruction.builder()
                        .parts(List.of(
                                GeminiRequest.Part.builder()
                                        .text(systemInstruction)
                                        .build()
                        ))
                        .build())
                .contents(List.of(GeminiRequest.Content.builder()
                        .role("user")
                        .parts(List.of(GeminiRequest.Part.builder()
                                .text(userPrompt)
                                .build()))
                        .build()))
                .generationConfig(GeminiRequest.GenerationConfig.builder()
                        .temperature(0.4)
                        .maxOutputTokens(1500)
                        .build())
                .build();

        try {
            String responseBody = restClient.post()
                    .uri(url)
                    .header("x-goog-api-key", properties.getApiKey())
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (req, res) -> {
                        log.warn("Gemini API error status={}",
                                res.getStatusCode());
                    })
                    .body(String.class);

            return extractText(responseBody);
        } catch (RestClientException ex) {
            log.warn("Gemini request failed: {}", ex.getMessage());
            throw new AppException(ErrorCode.AI_SERVICE_UNAVAILABLE);
        }
    }

    private String extractText(String responseBody) {
        if (responseBody == null || responseBody.isBlank()) {
            throw new AppException(ErrorCode.AI_SERVICE_UNAVAILABLE);
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                throw new AppException(ErrorCode.AI_SERVICE_UNAVAILABLE);
            }
            JsonNode parts = candidates.get(0)
                    .path("content")
                    .path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                throw new AppException(ErrorCode.AI_SERVICE_UNAVAILABLE);
            }
            StringBuilder sb = new StringBuilder();
            for (JsonNode part : parts) {
                JsonNode text = part.path("text");
                if (text.isTextual()) {
                    sb.append(text.asText());
                }
            }
            String text = sb.toString().trim();
            if (text.isEmpty()) {
                throw new AppException(ErrorCode.AI_SERVICE_UNAVAILABLE);
            }
            return text;
        } catch (Exception ex) {
            log.warn("Failed to parse Gemini response");
            throw new AppException(ErrorCode.AI_SERVICE_UNAVAILABLE);
        }
    }

    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class GeminiRequest {
        private SystemInstruction systemInstruction;
        private List<Content> contents;
        private GenerationConfig generationConfig;

        @lombok.Data
        @lombok.Builder
        @lombok.NoArgsConstructor
        @lombok.AllArgsConstructor
        public static class SystemInstruction {
            private List<Part> parts;
        }

        @lombok.Data
        @lombok.Builder
        @lombok.NoArgsConstructor
        @lombok.AllArgsConstructor
        public static class Content {
            private String role;
            private List<Part> parts;
        }

        @lombok.Data
        @lombok.Builder
        @lombok.NoArgsConstructor
        @lombok.AllArgsConstructor
        public static class Part {
            private String text;
        }

        @lombok.Data
        @lombok.Builder
        @lombok.NoArgsConstructor
        @lombok.AllArgsConstructor
        public static class GenerationConfig {
            @JsonProperty("temperature")
            private Double temperature;
            @JsonProperty("maxOutputTokens")
            private Integer maxOutputTokens;
            @JsonProperty("responseMimeType")
            private String responseMimeType;
        }
    }
}