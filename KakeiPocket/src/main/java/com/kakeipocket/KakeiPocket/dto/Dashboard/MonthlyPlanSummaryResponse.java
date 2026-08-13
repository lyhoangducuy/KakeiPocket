package com.kakeipocket.KakeiPocket.dto.Dashboard;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyPlanSummaryResponse {
    private Long id;
    private BigDecimal incomeTarget;
    private BigDecimal savingTarget;
    private String note;
}