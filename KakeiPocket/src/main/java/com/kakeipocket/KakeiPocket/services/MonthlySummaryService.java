package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.LargestExpenseResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.MonthlyFinancialStatusResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.MonthlySummaryOverviewResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.MonthlySummaryPeriodResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.MonthlySummaryResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.PeakSpendingDayResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.PlanComparisonResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.TopCategoryResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.TopWalletResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.TransactionSummaryResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.WalletSummaryResponse;
import com.kakeipocket.KakeiPocket.dto.WalletAlert.WalletAlertSummaryResponse;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.enums.FinancialStatus;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletAlertStatus;
import com.kakeipocket.KakeiPocket.enums.WalletType;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MonthlySummaryService {

    private static final BigDecimal HEALTHY_SAVING_RATE = new BigDecimal("20");
    private static final int MIN_MONTH = 1;
    private static final int MAX_MONTH = 12;
    private static final int MIN_YEAR = 1970;
    private static final int MAX_YEAR = 9999;

    private final TransactionRepository transactionRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final UserRepository userRepository;
    private final WalletAlertService walletAlertService;

    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlySummary(
            Long userId,
            Integer year,
            Integer month
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        YearMonth targetMonth = resolveYearMonth(year, month);
        LocalDate from = targetMonth.atDay(1);
        LocalDate to = targetMonth.atEndOfMonth();

        BigDecimal totalIncome = transactionRepository
                .sumByUserAndTypeAndDateRange(
                        user, TransactionType.INCOME, from, to
                );

        BigDecimal totalExpense = transactionRepository
                .sumByUserAndTypeAndDateRange(
                        user, TransactionType.EXPENSE, from, to
                );

        BigDecimal balance = totalIncome.subtract(totalExpense);

        MonthlySummaryOverviewResponse overview =
                MonthlySummaryOverviewResponse.builder()
                        .totalIncome(totalIncome)
                        .totalExpense(totalExpense)
                        .balance(balance)
                        .savingRate(calculateSavingRate(totalIncome, balance))
                        .build();

        TransactionSummaryResponse transactionSummary =
                buildTransactionSummary(user, from, to);

        PlanComparisonResponse planComparison = buildPlanComparison(
                user, totalIncome, balance, targetMonth
        );

        TopCategoryResponse topExpenseCategory =
                buildTopExpenseCategory(user, from, to, totalExpense);

        TopWalletResponse topExpenseWallet =
                buildTopExpenseWallet(user, from, to, totalExpense);

        LargestExpenseResponse largestExpense =
                buildLargestExpense(user, from, to);

        PeakSpendingDayResponse peakSpendingDay =
                buildPeakSpendingDay(user, from, to);

        WalletSummaryResponse walletSummary =
                buildWalletSummary(userId, year, month);

        MonthlyFinancialStatusResponse financialStatus =
                buildFinancialStatus(overview, walletSummary, totalIncome);

        MonthlySummaryPeriodResponse period =
                MonthlySummaryPeriodResponse.builder()
                        .year(targetMonth.getYear())
                        .month(targetMonth.getMonthValue())
                        .from(from.toString())
                        .to(to.toString())
                        .build();

        return MonthlySummaryResponse.builder()
                .period(period)
                .overview(overview)
                .transactionSummary(transactionSummary)
                .planComparison(planComparison)
                .topExpenseCategory(topExpenseCategory)
                .topExpenseWallet(topExpenseWallet)
                .largestExpense(largestExpense)
                .peakSpendingDay(peakSpendingDay)
                .walletSummary(walletSummary)
                .financialStatus(financialStatus)
                .build();
    }

    private TransactionSummaryResponse buildTransactionSummary(
            User user,
            LocalDate from,
            LocalDate to
    ) {
        long total = transactionRepository
                .countByUserAndDateRange(user, from, to);
        long income = transactionRepository
                .countByUserAndTypeAndDateRange(
                        user, TransactionType.INCOME, from, to
                );
        long expense = transactionRepository
                .countByUserAndTypeAndDateRange(
                        user, TransactionType.EXPENSE, from, to
                );

        return TransactionSummaryResponse.builder()
                .totalTransactions(total)
                .incomeTransactions(income)
                .expenseTransactions(expense)
                .build();
    }

    private PlanComparisonResponse buildPlanComparison(
            User user,
            BigDecimal totalIncome,
            BigDecimal balance,
            YearMonth targetMonth
    ) {
        Optional<MonthlyPlan> planOpt = monthlyPlanRepository
                .findByUserAndMonthAndYear(
                        user,
                        targetMonth.getMonthValue(),
                        targetMonth.getYear()
                );

        if (planOpt.isEmpty()) {
            return PlanComparisonResponse.builder()
                    .hasPlan(false)
                    .build();
        }

        MonthlyPlan plan = planOpt.get();
        BigDecimal incomeTarget = plan.getIncomeTarget();
        BigDecimal savingTarget = plan.getSavingTarget();

        BigDecimal incomeAchievement = calculateAchievement(
                totalIncome, incomeTarget
        );
        BigDecimal savingAchievement = calculateAchievement(
                balance, savingTarget
        );
        BigDecimal incomeDifference = safeSubtract(totalIncome, incomeTarget);
        BigDecimal savingDifference = safeSubtract(balance, savingTarget);

        return PlanComparisonResponse.builder()
                .hasPlan(true)
                .incomeTarget(incomeTarget)
                .actualIncome(totalIncome)
                .incomeAchievement(incomeAchievement)
                .incomeDifference(incomeDifference)
                .savingTarget(savingTarget)
                .actualSaving(balance)
                .savingAchievement(savingAchievement)
                .savingDifference(savingDifference)
                .build();
    }

    private TopCategoryResponse buildTopExpenseCategory(
            User user,
            LocalDate from,
            LocalDate to,
            BigDecimal totalExpense
    ) {
        List<TransactionRepository.CategoryAggregate> aggs =
                transactionRepository.aggregateExpenseByCategory(
                        user,
                        TransactionType.EXPENSE,
                        from,
                        to,
                        PageRequest.of(0, 1)
                );
        if (aggs.isEmpty()) {
            return null;
        }
        TransactionRepository.CategoryAggregate top = aggs.get(0);
        return TopCategoryResponse.builder()
                .categoryId(top.getCategoryId())
                .categoryName(top.getCategoryName())
                .amount(top.getTotalAmount())
                .percentage(computePercentage(top.getTotalAmount(), totalExpense))
                .build();
    }

    private TopWalletResponse buildTopExpenseWallet(
            User user,
            LocalDate from,
            LocalDate to,
            BigDecimal totalExpense
    ) {
        List<TransactionRepository.WalletAggregate> aggs =
                transactionRepository.aggregateExpenseByWallet(
                        user, TransactionType.EXPENSE, from, to
                );

        TransactionRepository.WalletAggregate top = null;
        for (TransactionRepository.WalletAggregate agg : aggs) {
            if (agg.getWalletType() == null
                    || agg.getWalletType() == WalletType.SAVING) {
                continue;
            }
            if (top == null
                    || agg.getTotalAmount().compareTo(top.getTotalAmount()) > 0) {
                top = agg;
            }
        }
        if (top == null) {
            return null;
        }
        return TopWalletResponse.builder()
                .walletType(top.getWalletType())
                .amount(top.getTotalAmount())
                .percentage(computePercentage(top.getTotalAmount(), totalExpense))
                .build();
    }

    private LargestExpenseResponse buildLargestExpense(
            User user,
            LocalDate from,
            LocalDate to
    ) {
        List<Transaction> top = transactionRepository.findTopExpense(
                user, TransactionType.EXPENSE, from, to,
                PageRequest.of(0, 1)
        );
        if (top.isEmpty()) {
            return null;
        }
        Transaction t = top.get(0);
        return LargestExpenseResponse.builder()
                .transactionId(t.getId())
                .amount(t.getAmount())
                .categoryId(t.getCategory() != null
                        ? t.getCategory().getId() : null)
                .categoryName(t.getCategory() != null
                        ? t.getCategory().getName() : null)
                .walletType(t.getWalletType())
                .date(t.getTransactionDate())
                .note(t.getNote())
                .build();
    }

    private PeakSpendingDayResponse buildPeakSpendingDay(
            User user,
            LocalDate from,
            LocalDate to
    ) {
        List<TransactionRepository.DailyExpenseAggregate> aggs =
                transactionRepository.aggregateExpenseByDay(
                        user, TransactionType.EXPENSE, from, to,
                        PageRequest.of(0, 1)
                );
        if (aggs.isEmpty()) {
            return null;
        }
        TransactionRepository.DailyExpenseAggregate top = aggs.get(0);
        return PeakSpendingDayResponse.builder()
                .date(top.getDate())
                .amount(top.getTotalAmount())
                .build();
    }

    private WalletSummaryResponse buildWalletSummary(
            Long userId,
            Integer year,
            Integer month
    ) {
        WalletAlertSummaryResponse alerts = walletAlertService
                .getWalletAlerts(userId, year, month);

        int warningCount = 0;
        int exceededCount = 0;
        for (var alert : alerts.getWallets()) {
            if (alert.getStatus() == WalletAlertStatus.WARNING) {
                warningCount++;
            } else if (alert.getStatus() == WalletAlertStatus.EXCEEDED) {
                exceededCount++;
            }
        }

        return WalletSummaryResponse.builder()
                .totalWarningWallets(warningCount)
                .totalExceededWallets(exceededCount)
                .hasBudgetAlert(warningCount + exceededCount > 0)
                .build();
    }

    private MonthlyFinancialStatusResponse buildFinancialStatus(
            MonthlySummaryOverviewResponse overview,
            WalletSummaryResponse walletSummary,
            BigDecimal totalIncome
    ) {
        boolean hasExceeded = walletSummary.getTotalExceededWallets() != null
                && walletSummary.getTotalExceededWallets() > 0;
        boolean hasWarning = walletSummary.getTotalWarningWallets() != null
                && walletSummary.getTotalWarningWallets() > 0;

        BigDecimal savingRate = overview.getSavingRate();
        boolean savingRateNegative = totalIncome.compareTo(BigDecimal.ZERO) > 0
                && savingRate.compareTo(BigDecimal.ZERO) < 0;
        boolean savingRateLow = totalIncome.compareTo(BigDecimal.ZERO) > 0
                && savingRate.compareTo(HEALTHY_SAVING_RATE) < 0;

        FinancialStatus status;
        String message;

        if (hasExceeded || savingRateNegative) {
            status = FinancialStatus.CRITICAL;
            message = "Chi tiêu tháng này đang vượt mức an toàn.";
        } else if (hasWarning || savingRateLow) {
            status = FinancialStatus.WARNING;
            message = "Chi tiêu của bạn cần được kiểm soát tốt hơn.";
        } else {
            status = FinancialStatus.HEALTHY;
            message = "Tháng này bạn đang kiểm soát tài chính tốt.";
        }

        return MonthlyFinancialStatusResponse.builder()
                .status(status)
                .message(message)
                .build();
    }

    private BigDecimal calculateSavingRate(
            BigDecimal totalIncome,
            BigDecimal balance
    ) {
        if (totalIncome == null
                || totalIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return balance
                .multiply(BigDecimal.valueOf(100))
                .divide(totalIncome, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateAchievement(
            BigDecimal actual,
            BigDecimal target
    ) {
        if (target == null
                || target.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (actual == null
                || actual.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return actual
                .multiply(BigDecimal.valueOf(100))
                .divide(target, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal safeSubtract(
            BigDecimal minuend,
            BigDecimal subtrahend
    ) {
        BigDecimal m = minuend != null ? minuend : BigDecimal.ZERO;
        BigDecimal s = subtrahend != null ? subtrahend : BigDecimal.ZERO;
        return m.subtract(s);
    }

    private BigDecimal computePercentage(
            BigDecimal amount,
            BigDecimal total
    ) {
        if (total == null
                || total.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (amount == null
                || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return amount
                .multiply(BigDecimal.valueOf(100))
                .divide(total, 2, RoundingMode.HALF_UP);
    }

    private YearMonth resolveYearMonth(Integer year, Integer month) {
        int resolvedYear = (year != null)
                ? year
                : LocalDate.now().getYear();
        int resolvedMonth = (month != null)
                ? month
                : LocalDate.now().getMonthValue();

        if (resolvedMonth < MIN_MONTH || resolvedMonth > MAX_MONTH) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (resolvedYear < MIN_YEAR || resolvedYear > MAX_YEAR) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return YearMonth.of(resolvedYear, resolvedMonth);
    }
}