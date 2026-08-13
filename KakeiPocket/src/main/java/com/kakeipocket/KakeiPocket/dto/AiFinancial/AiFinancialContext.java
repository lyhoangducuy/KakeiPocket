package com.kakeipocket.KakeiPocket.dto.AiFinancial;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.kakeipocket.KakeiPocket.enums.WalletType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiFinancialContext {
    private Integer year;
    private Integer month;
    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal balance;
    private BigDecimal savingRate;
    private BigDecimal incomeTarget;
    private BigDecimal savingTarget;
    private BigDecimal incomeAchievement;
    private BigDecimal savingAchievement;
    private Long totalTransactions;
    private Long incomeTransactions;
    private Long expenseTransactions;
    private Boolean hasMonthlyPlan;
    private String financialStatus;

    private String topCategoryName;
    private BigDecimal topCategoryAmount;
    private BigDecimal topCategoryPercentage;

    private WalletType topWalletType;
    private BigDecimal topWalletAmount;
    private BigDecimal topWalletPercentage;

    private BigDecimal largestExpenseAmount;
    private String largestExpenseCategory;
    private LocalDate largestExpenseDate;
    private String largestExpenseNote;

    private LocalDate peakSpendingDate;
    private BigDecimal peakSpendingAmount;

    private Integer warningWalletCount;
    private Integer exceededWalletCount;

    private java.util.List<WalletContext> wallets;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WalletContext {
        private WalletType walletType;
        private BigDecimal limit;
        private BigDecimal spent;
        private BigDecimal usagePercentage;
        private String status;
    }
}