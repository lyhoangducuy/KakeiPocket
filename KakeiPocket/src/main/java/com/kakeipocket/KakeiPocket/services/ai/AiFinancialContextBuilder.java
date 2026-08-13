package com.kakeipocket.KakeiPocket.services.ai;

import com.kakeipocket.KakeiPocket.dto.AiFinancial.AiFinancialContext;
import com.kakeipocket.KakeiPocket.dto.AiFinancial.AiFinancialContext.WalletContext;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.MonthlySummaryResponse;
import com.kakeipocket.KakeiPocket.dto.WalletAlert.WalletAlertResponse;
import com.kakeipocket.KakeiPocket.dto.WalletAlert.WalletAlertSummaryResponse;
import com.kakeipocket.KakeiPocket.enums.WalletType;
import com.kakeipocket.KakeiPocket.services.MonthlySummaryService;
import com.kakeipocket.KakeiPocket.services.WalletAlertService;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AiFinancialContextBuilder {

    private final MonthlySummaryService monthlySummaryService;
    private final WalletAlertService walletAlertService;

    public AiFinancialContext build(
            Long userId,
            Integer year,
            Integer month
    ) {
        MonthlySummaryResponse summary = monthlySummaryService
                .getMonthlySummary(userId, year, month);
        WalletAlertSummaryResponse alerts = walletAlertService
                .getWalletAlerts(userId, year, month);

        List<WalletContext> wallets = alerts.getWallets().stream()
                .map(this::toWalletContext)
                .collect(Collectors.toList());

        BigDecimal largestAmount = summary.getLargestExpense() != null
                ? summary.getLargestExpense().getAmount()
                : null;
        String largestCategory = summary.getLargestExpense() != null
                ? summary.getLargestExpense().getCategoryName()
                : null;

        return AiFinancialContext.builder()
                .year(summary.getPeriod().getYear())
                .month(summary.getPeriod().getMonth())
                .totalIncome(summary.getOverview().getTotalIncome())
                .totalExpense(summary.getOverview().getTotalExpense())
                .balance(summary.getOverview().getBalance())
                .savingRate(summary.getOverview().getSavingRate())
                .incomeTarget(summary.getPlanComparison().getHasPlan()
                        ? summary.getPlanComparison().getIncomeTarget()
                        : null)
                .savingTarget(summary.getPlanComparison().getHasPlan()
                        ? summary.getPlanComparison().getSavingTarget()
                        : null)
                .incomeAchievement(summary.getPlanComparison().getHasPlan()
                        ? summary.getPlanComparison().getIncomeAchievement()
                        : null)
                .savingAchievement(summary.getPlanComparison().getHasPlan()
                        ? summary.getPlanComparison().getSavingAchievement()
                        : null)
                .totalTransactions(
                        summary.getTransactionSummary().getTotalTransactions())
                .incomeTransactions(
                        summary.getTransactionSummary().getIncomeTransactions())
                .expenseTransactions(
                        summary.getTransactionSummary().getExpenseTransactions())
                .hasMonthlyPlan(summary.getPlanComparison().getHasPlan())
                .financialStatus(
                        summary.getFinancialStatus().getStatus().name())
                .topCategoryName(
                        summary.getTopExpenseCategory() != null
                                ? summary.getTopExpenseCategory()
                                        .getCategoryName()
                                : null)
                .topCategoryAmount(
                        summary.getTopExpenseCategory() != null
                                ? summary.getTopExpenseCategory().getAmount()
                                : null)
                .topCategoryPercentage(
                        summary.getTopExpenseCategory() != null
                                ? summary.getTopExpenseCategory().getPercentage()
                                : null)
                .topWalletType(
                        summary.getTopExpenseWallet() != null
                                ? summary.getTopExpenseWallet().getWalletType()
                                : null)
                .topWalletAmount(
                        summary.getTopExpenseWallet() != null
                                ? summary.getTopExpenseWallet().getAmount()
                                : null)
                .topWalletPercentage(
                        summary.getTopExpenseWallet() != null
                                ? summary.getTopExpenseWallet().getPercentage()
                                : null)
                .largestExpenseAmount(largestAmount)
                .largestExpenseCategory(largestCategory)
                .largestExpenseDate(
                        summary.getLargestExpense() != null
                                ? summary.getLargestExpense().getDate()
                                : null)
                .largestExpenseNote(
                        summary.getLargestExpense() != null
                                ? summary.getLargestExpense().getNote()
                                : null)
                .peakSpendingDate(
                        summary.getPeakSpendingDay() != null
                                ? summary.getPeakSpendingDay().getDate()
                                : null)
                .peakSpendingAmount(
                        summary.getPeakSpendingDay() != null
                                ? summary.getPeakSpendingDay().getAmount()
                                : null)
                .warningWalletCount(
                        summary.getWalletSummary().getTotalWarningWallets())
                .exceededWalletCount(
                        summary.getWalletSummary().getTotalExceededWallets())
                .wallets(wallets)
                .build();
    }

    private WalletContext toWalletContext(
            WalletAlertResponse alert
    ) {
        WalletType type = alert.getWalletType();
        BigDecimal limit = alert.getLimit();
        BigDecimal spent = alert.getSpent();
        BigDecimal usage = alert.getUsagePercentage();

        return WalletContext.builder()
                .walletType(type)
                .limit(limit)
                .spent(spent)
                .usagePercentage(usage)
                .status(alert.getStatus().name())
                .build();
    }
}