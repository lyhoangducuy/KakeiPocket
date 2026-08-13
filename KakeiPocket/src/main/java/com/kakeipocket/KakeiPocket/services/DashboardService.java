package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.dto.Dashboard.DashboardResponse;
import com.kakeipocket.KakeiPocket.dto.Dashboard.ExpenseSummaryResponse;
import com.kakeipocket.KakeiPocket.dto.Dashboard.IncomeSummaryResponse;
import com.kakeipocket.KakeiPocket.dto.Dashboard.MonthlyPlanSummaryResponse;
import com.kakeipocket.KakeiPocket.dto.Dashboard.RecentTransactionResponse;
import com.kakeipocket.KakeiPocket.dto.Dashboard.SavingSummaryResponse;
import com.kakeipocket.KakeiPocket.dto.Dashboard.TopExpenseCategoryResponse;
import com.kakeipocket.KakeiPocket.dto.Dashboard.WalletSummaryResponse;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.entity.WalletLimit;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletType;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;
import com.kakeipocket.KakeiPocket.repository.WalletLimitRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final WalletLimitRepository walletLimitRepository;
    private final UserRepository userRepository;

    private static final List<WalletType> WALLET_TYPES = Arrays.asList(
            WalletType.NECESSARY,
            WalletType.WANTS,
            WalletType.CULTURE,
            WalletType.UNEXPECTED
    );

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(
            Long userId,
            Integer year,
            Integer month
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        YearMonth targetMonth = resolveYearMonth(year, month);
        LocalDate from = targetMonth.atDay(1);
        LocalDate to = targetMonth.atEndOfMonth();

        Optional<MonthlyPlan> monthlyPlanOpt = monthlyPlanRepository
                .findByUserAndMonthAndYear(
                        user, targetMonth.getMonthValue(), targetMonth.getYear()
                );

        BigDecimal totalIncome = transactionRepository
                .sumByUserAndTypeAndDateRange(
                        user, TransactionType.INCOME, from, to
                );

        BigDecimal totalExpense = transactionRepository
                .sumByUserAndTypeAndDateRange(
                        user, TransactionType.EXPENSE, from, to
                );

        BigDecimal balance = totalIncome.subtract(totalExpense);

        MonthlyPlanSummaryResponse monthlyPlanSummary = monthlyPlanOpt
                .map(this::toMonthlyPlanSummary)
                .orElse(null);

        IncomeSummaryResponse incomeSummary = buildIncomeSummary(
                monthlyPlanOpt.orElse(null), totalIncome
        );

        ExpenseSummaryResponse expenseSummary = ExpenseSummaryResponse.builder()
                .total(totalExpense)
                .build();

        SavingSummaryResponse savingSummary = buildSavingSummary(
                monthlyPlanOpt.orElse(null), balance
        );

        List<WalletSummaryResponse> wallets = buildWalletSummaries(
                monthlyPlanOpt.orElse(null), user, from, to
        );

        List<RecentTransactionResponse> recent = transactionRepository
                .findRecentByUserAndDateRange(
                        user, from, to, PageRequest.of(0, 5)
                )
                .stream()
                .map(this::toRecentTransactionResponse)
                .collect(Collectors.toList());

        List<TopExpenseCategoryResponse> topCategories = transactionRepository
                .aggregateExpenseByCategory(
                        user, TransactionType.EXPENSE, from, to,
                        PageRequest.of(0, 5)
                )
                .stream()
                .map(agg -> TopExpenseCategoryResponse.builder()
                        .categoryId(agg.getCategoryId())
                        .categoryName(agg.getCategoryName())
                        .totalAmount(agg.getTotalAmount())
                        .build())
                .collect(Collectors.toList());

        return DashboardResponse.builder()
                .year(targetMonth.getYear())
                .month(targetMonth.getMonthValue())
                .monthlyPlan(monthlyPlanSummary)
                .income(incomeSummary)
                .expense(expenseSummary)
                .balance(balance)
                .saving(savingSummary)
                .wallets(wallets)
                .recentTransactions(recent)
                .topExpenseCategories(topCategories)
                .build();
    }

    private YearMonth resolveYearMonth(Integer year, Integer month) {
        int resolvedYear = (year != null)
                ? year
                : LocalDate.now().getYear();
        int resolvedMonth = (month != null) ? month : LocalDate.now().getMonthValue();

        if (resolvedMonth < 1 || resolvedMonth > 12) {
            throw new RuntimeException("Tháng không hợp lệ (1-12)");
        }

        return YearMonth.of(resolvedYear, resolvedMonth);
    }

    private MonthlyPlanSummaryResponse toMonthlyPlanSummary(
            MonthlyPlan plan
    ) {
        return MonthlyPlanSummaryResponse.builder()
                .id(plan.getId())
                .incomeTarget(plan.getIncomeTarget())
                .savingTarget(plan.getSavingTarget())
                .note(plan.getNote())
                .build();
    }

    private IncomeSummaryResponse buildIncomeSummary(
            MonthlyPlan plan,
            BigDecimal totalIncome
    ) {
        BigDecimal target = plan != null ? plan.getIncomeTarget() : null;
        Double progress = computeProgress(totalIncome, target);

        return IncomeSummaryResponse.builder()
                .total(totalIncome)
                .target(target)
                .progress(progress)
                .build();
    }

    private SavingSummaryResponse buildSavingSummary(
            MonthlyPlan plan,
            BigDecimal actualSaving
    ) {
        BigDecimal target = plan != null ? plan.getSavingTarget() : null;
        Double progress = computeProgress(actualSaving, target);

        return SavingSummaryResponse.builder()
                .target(target)
                .actual(actualSaving)
                .progress(progress)
                .build();
    }

    private Double computeProgress(BigDecimal actual, BigDecimal target) {
        if (target == null || target.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }
        if (actual == null || actual.compareTo(BigDecimal.ZERO) <= 0) {
            return 0.0;
        }

        BigDecimal ratio = actual
                .multiply(BigDecimal.valueOf(100))
                .divide(target, 2, RoundingMode.HALF_UP);

        double pct = ratio.doubleValue();
        if (pct > 100.0) return 100.0;
        return pct;
    }

    private List<WalletSummaryResponse> buildWalletSummaries(
            MonthlyPlan plan,
            User user,
            LocalDate from,
            LocalDate to
    ) {
        List<WalletLimit> limits = (plan != null)
                ? walletLimitRepository.findByMonthlyPlan(plan)
                : List.of();

        return WALLET_TYPES.stream().map(walletType -> {
            BigDecimal limit = limits.stream()
                    .filter(l -> l.getWalletType() == walletType)
                    .findFirst()
                    .map(WalletLimit::getLimitAmount)
                    .orElse(BigDecimal.ZERO);

            BigDecimal spent = transactionRepository
                    .sumByUserAndTypeAndWalletAndDateRange(
                            user,
                            TransactionType.EXPENSE,
                            walletType,
                            from,
                            to
                    );

            BigDecimal remaining = limit.subtract(spent);

            Double percentage = 0.0;
            if (limit.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal pct = spent
                        .multiply(BigDecimal.valueOf(100))
                        .divide(limit, 2, RoundingMode.HALF_UP);
                percentage = pct.doubleValue();
            }

            return WalletSummaryResponse.builder()
                    .walletType(walletType)
                    .limit(limit)
                    .spent(spent)
                    .remaining(remaining)
                    .percentage(percentage)
                    .build();
        }).collect(Collectors.toList());
    }

    private RecentTransactionResponse toRecentTransactionResponse(
            Transaction transaction
    ) {
        return RecentTransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .categoryId(transaction.getCategory() != null
                        ? transaction.getCategory().getId()
                        : null)
                .categoryName(transaction.getCategory() != null
                        ? transaction.getCategory().getName()
                        : null)
                .walletType(transaction.getWalletType())
                .amount(transaction.getAmount())
                .transactionDate(transaction.getTransactionDate())
                .note(transaction.getNote())
                .build();
    }
}