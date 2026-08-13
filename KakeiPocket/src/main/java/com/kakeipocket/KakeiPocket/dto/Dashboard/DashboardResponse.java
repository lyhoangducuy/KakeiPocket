package com.kakeipocket.KakeiPocket.dto.Dashboard;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private Integer year;
    private Integer month;

    private MonthlyPlanSummaryResponse monthlyPlan;

    private IncomeSummaryResponse income;
    private ExpenseSummaryResponse expense;
    private BigDecimal balance;

    private SavingSummaryResponse saving;

    private List<WalletSummaryResponse> wallets;

    private List<RecentTransactionResponse> recentTransactions;

    private List<TopExpenseCategoryResponse> topExpenseCategories;
}