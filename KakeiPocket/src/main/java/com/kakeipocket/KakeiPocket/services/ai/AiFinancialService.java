package com.kakeipocket.KakeiPocket.services.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.AiFinancial.AiFinancialAnalysisResponse;
import com.kakeipocket.KakeiPocket.dto.AiFinancial.AiFinancialContext;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiFinancialService {

    private static final Set<String> VALID_HEALTH = Set.of(
            "GOOD", "FAIR", "WARNING", "CRITICAL"
    );

    private final AiFinancialContextBuilder contextBuilder;
    private final AiPromptBuilder promptBuilder;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public AiFinancialAnalysisResponse analyze(
            Long userId,
            Integer year,
            Integer month,
            String question
    ) {
        AiFinancialContext context = contextBuilder.build(
                userId, year, month
        );

        String userPrompt = promptBuilder.userPrompt(
                context, question
        );

        String rawResponse = geminiService.generateContent(
                promptBuilder.systemInstruction(),
                userPrompt
        );

        ParsedAnalysis parsed = parseResponse(rawResponse);

        boolean hasQuestion = question != null
                && !question.isBlank();

        return AiFinancialAnalysisResponse.builder()
                .year(context.getYear())
                .month(context.getMonth())
                .summary(parsed.summary)
                .financialHealth(parsed.health)
                .keyInsights(parsed.keyInsights)
                .warnings(parsed.warnings)
                .recommendations(parsed.recommendations)
                .savingSuggestions(parsed.savingSuggestions)
                .nextMonthGoals(parsed.nextMonthGoals)
                .generatedForQuestion(hasQuestion)
                .question(hasQuestion ? question : null)
                .build();
    }

    private ParsedAnalysis parseResponse(String raw) {
        String json = stripCodeFence(raw);

        JsonNode node;
        try {
            node = objectMapper.readTree(json);
        } catch (Exception ex) {
            log.warn("Gemini returned non-JSON response");
            throw new AppException(ErrorCode.AI_SERVICE_UNAVAILABLE);
        }

        ParsedAnalysis out = new ParsedAnalysis();
        out.summary = textOrFallback(
                node.path("summary"),
                "Không đủ dữ liệu để kết luận."
        );
        out.health = normalizeHealth(
                textOrNull(node.path("financialHealth"))
        );
        out.keyInsights = readStringArray(node.path("keyInsights"));
        out.warnings = readStringArray(node.path("warnings"));
        out.recommendations =
                readStringArray(node.path("recommendations"));
        out.savingSuggestions =
                readStringArray(node.path("savingSuggestions"));
        out.nextMonthGoals =
                readStringArray(node.path("nextMonthGoals"));
        return out;
    }

    private String stripCodeFence(String raw) {
        if (raw == null) return "{}";
        String s = raw.trim();
        if (s.startsWith("```")) {
            int firstNewline = s.indexOf('\n');
            if (firstNewline > 0) {
                s = s.substring(firstNewline + 1);
            }
            int lastFence = s.lastIndexOf("```");
            if (lastFence >= 0) {
                s = s.substring(0, lastFence);
            }
            s = s.trim();
        }
        int firstBrace = s.indexOf('{');
        int lastBrace = s.lastIndexOf('}');
        if (firstBrace >= 0 && lastBrace > firstBrace) {
            return s.substring(firstBrace, lastBrace + 1);
        }
        return s;
    }

    private String textOrFallback(JsonNode node, String fallback) {
        return node.isTextual() ? node.asText() : fallback;
    }

    private String textOrNull(JsonNode node) {
        return node.isTextual() ? node.asText() : null;
    }

    private String normalizeHealth(String value) {
        if (value == null) return "FAIR";
        String v = value.toUpperCase(Locale.ROOT);
        return VALID_HEALTH.contains(v) ? v : "FAIR";
    }

    private List<String> readStringArray(JsonNode node) {
        List<String> out = new ArrayList<>();
        if (node == null || !node.isArray()) {
            return out;
        }
        Iterator<JsonNode> it = node.elements();
        while (it.hasNext()) {
            JsonNode child = it.next();
            if (child.isTextual()) {
                String s = child.asText();
                if (s != null && !s.isBlank()) {
                    out.add(s);
                }
            }
        }
        return out;
    }

    private static class ParsedAnalysis {
        String summary;
        String health;
        List<String> keyInsights = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<String> savingSuggestions = new ArrayList<>();
        List<String> nextMonthGoals = new ArrayList<>();
    }
}