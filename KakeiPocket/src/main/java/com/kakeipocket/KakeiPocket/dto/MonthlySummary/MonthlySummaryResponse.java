package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummaryResponse {
    private MonthlySummaryPeriodResponse period;

    private MonthlySummaryOverviewResponse overview;

    private TransactionSummaryResponse transactionSummary;

    private PlanComparisonResponse planComparison;

    private TopCategoryResponse topExpenseCategory;

    private TopWalletResponse topExpenseWallet;

    private LargestExpenseResponse largestExpense;

    private PeakSpendingDayResponse peakSpendingDay;

    private WalletSummaryResponse walletSummary;

    private MonthlyFinancialStatusResponse financialStatus;
}