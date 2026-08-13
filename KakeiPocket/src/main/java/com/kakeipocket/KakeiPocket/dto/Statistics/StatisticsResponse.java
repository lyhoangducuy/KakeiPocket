package com.kakeipocket.KakeiPocket.dto.Statistics;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsResponse {
    private StatisticsPeriodResponse period;

    private StatisticsOverviewResponse overview;

    private List<IncomeExpenseTrendResponse> incomeExpenseTrend;

    private List<CategoryStatisticResponse> expenseByCategory;

    private List<WalletExpenseStatisticResponse> expenseByWallet;

    private List<CategoryStatisticResponse> incomeByCategory;

    private List<TopExpenseCategoryResponse> topExpenseCategories;

    private MonthlyPlanComparisonResponse monthlyPlanComparison;
}