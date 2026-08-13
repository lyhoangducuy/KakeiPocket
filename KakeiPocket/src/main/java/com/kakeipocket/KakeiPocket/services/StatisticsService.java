package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.dto.Statistics.CategoryStatisticResponse;
import com.kakeipocket.KakeiPocket.dto.Statistics.IncomeExpenseTrendResponse;
import com.kakeipocket.KakeiPocket.dto.Statistics.MonthlyPlanComparisonResponse;
import com.kakeipocket.KakeiPocket.dto.Statistics.StatisticsOverviewResponse;
import com.kakeipocket.KakeiPocket.dto.Statistics.StatisticsPeriodResponse;
import com.kakeipocket.KakeiPocket.dto.Statistics.StatisticsResponse;
import com.kakeipocket.KakeiPocket.dto.Statistics.TopExpenseCategoryResponse;
import com.kakeipocket.KakeiPocket.dto.Statistics.WalletExpenseStatisticResponse;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
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
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final TransactionRepository transactionRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final UserRepository userRepository;

    private static final List<WalletType> WALLET_TYPES = Arrays.asList(
            WalletType.NECESSARY,
            WalletType.WANTS,
            WalletType.CULTURE,
            WalletType.UNEXPECTED
    );

    private static final List<String> WALLET_LABELS = Arrays.asList(
            "Thiết yếu", "Mong muốn", "Tinh thần", "Phát sinh"
    );

    private static final List<String> CHART_COLORS = Arrays.asList(
            "#2563eb",
            "#16a34a",
            "#f59e0b",
            "#dc2626",
            "#8b5cf6",
            "#ec4899",
            "#06b6d4",
            "#84cc16"
    );

    @Transactional(readOnly = true)
    public StatisticsResponse getStatistics(
            Long userId,
            Integer year,
            Integer month,
            LocalDate from,
            LocalDate to
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean customRange = from != null || to != null;

        if (customRange) {
            if (from == null || to == null) {
                throw new RuntimeException(
                        "Cần cả from và to cho khoảng thời gian tùy chỉnh"
                );
            }
            if (from.isAfter(to)) {
                throw new RuntimeException(
                        "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc"
                );
            }
        } else {
            YearMonth targetMonth = resolveYearMonth(year, month);
            from = targetMonth.atDay(1);
            to = targetMonth.atEndOfMonth();
        }

        BigDecimal totalIncome = transactionRepository
                .sumByUserAndTypeAndDateRange(
                        user, TransactionType.INCOME, from, to
                );

        BigDecimal totalExpense = transactionRepository
                .sumByUserAndTypeAndDateRange(
                        user, TransactionType.EXPENSE, from, to
                );

        BigDecimal balance = totalIncome.subtract(totalExpense);

        BigDecimal savingRate = calculateSavingRate(totalIncome, balance);

        StatisticsOverviewResponse overview = StatisticsOverviewResponse
                .builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .balance(balance)
                .savingRate(savingRate)
                .build();

        List<IncomeExpenseTrendResponse> trend = buildDailyTrend(
                user, from, to
        );

        List<CategoryStatisticResponse> expenseByCategory =
                transactionRepository
                        .aggregateExpenseByCategory(
                                user,
                                TransactionType.EXPENSE,
                                from,
                                to,
                                PageRequest.of(0, 1000)
                        )
                        .stream()
                        .map(agg -> mapCategoryWithPercentage(
                                CategoryStatisticResponse.builder()
                                        .categoryId(agg.getCategoryId())
                                        .categoryName(agg.getCategoryName())
                                        .amount(agg.getTotalAmount())
                                        .build(),
                                totalExpense
                        ))
                        .collect(Collectors.toList());

        List<CategoryStatisticResponse> incomeByCategory =
                transactionRepository
                        .aggregateExpenseByCategory(
                                user,
                                TransactionType.INCOME,
                                from,
                                to,
                                PageRequest.of(0, 1000)
                        )
                        .stream()
                        .map(agg -> mapCategoryWithPercentage(
                                CategoryStatisticResponse.builder()
                                        .categoryId(agg.getCategoryId())
                                        .categoryName(agg.getCategoryName())
                                        .amount(agg.getTotalAmount())
                                        .build(),
                                totalIncome
                        ))
                        .collect(Collectors.toList());

        List<WalletExpenseStatisticResponse> expenseByWallet =
                buildWalletStatistics(user, from, to, totalExpense);

        List<TopExpenseCategoryResponse> topExpenseCategories =
                transactionRepository
                        .aggregateExpenseByCategory(
                                user,
                                TransactionType.EXPENSE,
                                from,
                                to,
                                PageRequest.of(0, 5)
                        )
                        .stream()
                        .map(agg -> TopExpenseCategoryResponse.builder()
                                .categoryId(agg.getCategoryId())
                                .categoryName(agg.getCategoryName())
                                .amount(agg.getTotalAmount())
                                .percentage(computePercentage(
                                        agg.getTotalAmount(),
                                        totalExpense
                                ))
                                .build())
                        .collect(Collectors.toList());

        MonthlyPlanComparisonResponse monthlyPlanComparison =
                buildMonthlyPlanComparison(user, totalIncome, balance, from);

        StatisticsPeriodResponse period = StatisticsPeriodResponse
                .builder()
                .from(from.toString())
                .to(to.toString())
                .mode(customRange ? "CUSTOM" : "MONTH")
                .build();

        return StatisticsResponse.builder()
                .period(period)
                .overview(overview)
                .incomeExpenseTrend(trend)
                .expenseByCategory(expenseByCategory)
                .expenseByWallet(expenseByWallet)
                .incomeByCategory(incomeByCategory)
                .topExpenseCategories(topExpenseCategories)
                .monthlyPlanComparison(monthlyPlanComparison)
                .build();
    }

    private CategoryStatisticResponse mapCategoryWithPercentage(
            CategoryStatisticResponse base,
            BigDecimal total
    ) {
        base.setPercentage(computePercentage(base.getAmount(), total));
        return base;
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

    private BigDecimal calculateSavingRate(
            BigDecimal totalIncome,
            BigDecimal balance
    ) {
        if (totalIncome == null || totalIncome.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return balance
                .multiply(BigDecimal.valueOf(100))
                .divide(totalIncome, 2, RoundingMode.HALF_UP);
    }

    private List<IncomeExpenseTrendResponse> buildDailyTrend(
            User user,
            LocalDate from,
            LocalDate to
    ) {
        List<TransactionRepository.DailyAggregate> aggregates =
                transactionRepository.aggregateDaily(user, from, to);

        Map<LocalDate, BigDecimal[]> mapByDate = new LinkedHashMap<>();
        for (LocalDate d = from; !d.isAfter(to); d = d.plusDays(1)) {
            mapByDate.put(d, new BigDecimal[] {
                    BigDecimal.ZERO, BigDecimal.ZERO
            });
        }

        for (TransactionRepository.DailyAggregate agg : aggregates) {
            BigDecimal[] entry = mapByDate.get(agg.getDate());
            if (entry == null) continue;
            if (agg.getType() == TransactionType.INCOME) {
                entry[0] = agg.getTotalAmount();
            } else {
                entry[1] = agg.getTotalAmount();
            }
        }

        List<IncomeExpenseTrendResponse> result = new ArrayList<>();
        for (Map.Entry<LocalDate, BigDecimal[]> entry : mapByDate.entrySet()) {
            result.add(IncomeExpenseTrendResponse.builder()
                    .date(entry.getKey().toString())
                    .income(entry.getValue()[0])
                    .expense(entry.getValue()[1])
                    .build());
        }
        return result;
    }

    private List<WalletExpenseStatisticResponse> buildWalletStatistics(
            User user,
            LocalDate from,
            LocalDate to,
            BigDecimal totalExpense
    ) {
        Map<WalletType, BigDecimal> spentByWallet = new HashMap<>();
        for (TransactionRepository.WalletAggregate agg : transactionRepository
                .aggregateExpenseByWallet(
                        user, TransactionType.EXPENSE, from, to
                )) {
            spentByWallet.put(agg.getWalletType(), agg.getTotalAmount());
        }

        List<WalletExpenseStatisticResponse> result = new ArrayList<>();
        for (int i = 0; i < WALLET_TYPES.size(); i++) {
            WalletType wt = WALLET_TYPES.get(i);
            BigDecimal spent = spentByWallet.getOrDefault(
                    wt, BigDecimal.ZERO
            );
            result.add(WalletExpenseStatisticResponse.builder()
                    .walletType(wt)
                    .amount(spent)
                    .percentage(computePercentage(spent, totalExpense))
                    .build());
        }
        return result;
    }

    private MonthlyPlanComparisonResponse buildMonthlyPlanComparison(
            User user,
            BigDecimal totalIncome,
            BigDecimal balance,
            LocalDate from
    ) {
        Optional<MonthlyPlan> planOpt = monthlyPlanRepository
                .findByUserAndMonthAndYear(
                        user, from.getMonthValue(), from.getYear()
                );

        if (planOpt.isEmpty()) {
            return MonthlyPlanComparisonResponse.builder()
                    .hasPlan(false)
                    .build();
        }

        MonthlyPlan plan = planOpt.get();
        BigDecimal incomeTarget = plan.getIncomeTarget();
        BigDecimal savingTarget = plan.getSavingTarget();

        return MonthlyPlanComparisonResponse.builder()
                .hasPlan(true)
                .incomeTarget(incomeTarget)
                .actualIncome(totalIncome)
                .incomeAchievement(computePercentage(
                        totalIncome, incomeTarget
                ))
                .savingTarget(savingTarget)
                .actualSaving(balance)
                .savingAchievement(computePercentage(
                        balance, savingTarget
                ))
                .build();
    }

    private BigDecimal computePercentage(
            BigDecimal amount,
            BigDecimal total
    ) {
        if (total == null || total.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return amount
                .multiply(BigDecimal.valueOf(100))
                .divide(total, 2, RoundingMode.HALF_UP);
    }

    public List<String> getWalletLabels() {
        return WALLET_LABELS;
    }

    public List<String> getChartColors() {
        return CHART_COLORS;
    }
}