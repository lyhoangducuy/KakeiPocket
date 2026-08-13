package com.kakeipocket.KakeiPocket.dto.Statistics;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeExpenseTrendResponse {
    private String date;
    private BigDecimal income;
    private BigDecimal expense;
}