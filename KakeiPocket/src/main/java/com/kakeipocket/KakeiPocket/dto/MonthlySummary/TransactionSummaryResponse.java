package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSummaryResponse {
    private Long totalTransactions;
    private Long incomeTransactions;
    private Long expenseTransactions;
}