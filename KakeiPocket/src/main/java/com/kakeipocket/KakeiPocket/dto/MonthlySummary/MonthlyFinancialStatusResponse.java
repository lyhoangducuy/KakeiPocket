package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import com.kakeipocket.KakeiPocket.enums.FinancialStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyFinancialStatusResponse {
    private FinancialStatus status;
    private String message;
}