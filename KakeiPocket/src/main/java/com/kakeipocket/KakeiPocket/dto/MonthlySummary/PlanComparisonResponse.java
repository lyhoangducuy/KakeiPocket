package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanComparisonResponse {
    private Boolean hasPlan;
    private BigDecimal incomeTarget;
    private BigDecimal actualIncome;
    private BigDecimal incomeAchievement;
    private BigDecimal incomeDifference;
    private BigDecimal savingTarget;
    private BigDecimal actualSaving;
    private BigDecimal savingAchievement;
    private BigDecimal savingDifference;
}