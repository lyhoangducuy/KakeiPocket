package com.kakeipocket.KakeiPocket.dto.AiFinancial;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiFinancialAnalysisResponse {
    private Integer year;
    private Integer month;
    private String summary;
    private String financialHealth;
    private List<String> keyInsights;
    private List<String> warnings;
    private List<String> recommendations;
    private List<String> savingSuggestions;
    private List<String> nextMonthGoals;
    private Boolean generatedForQuestion;
    private String question;
}