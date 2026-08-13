package com.kakeipocket.KakeiPocket.dto.Statistics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyPlanComparisonResponse {
    private Boolean hasPlan;
    private java.math.BigDecimal incomeTarget;
    private java.math.BigDecimal actualIncome;
    private java.math.BigDecimal incomeAchievement;
    private java.math.BigDecimal savingTarget;
    private java.math.BigDecimal actualSaving;
    private java.math.BigDecimal savingAchievement;
}