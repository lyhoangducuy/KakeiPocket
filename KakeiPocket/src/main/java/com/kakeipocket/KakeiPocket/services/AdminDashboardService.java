package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminDashboardChartResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminDashboardChartResponse.TransactionStatisticPoint;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminDashboardChartResponse.UserGrowthPoint;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminDashboardSummaryResponse;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;
import com.kakeipocket.KakeiPocket.repository.WalletLimitRepository;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private static final String ADMIN_ROLE = "ADMIN";
    private static final int CHART_PERIOD_MONTHS = 12;

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final WalletLimitRepository walletLimitRepository;
    private final AuthenticationService authenticationService;

    /**
     * Returns summary statistics for the entire system.
     * Only ROLE_ADMIN is allowed.
     */
    @Transactional(readOnly = true)
    public AdminDashboardSummaryResponse getSummary(HttpSession session) {
        requireAdmin(session);

        long totalUsers = safeCount(userRepository::countAll);
        long totalTransactions = safeCount(transactionRepository::countAll);

        BigDecimal totalIncome = safeSum(
                () -> transactionRepository.sumAllByType(TransactionType.INCOME));
        BigDecimal totalExpense = safeSum(
                () -> transactionRepository.sumAllByType(TransactionType.EXPENSE));

        long totalMonthlyPlans = safeCount(monthlyPlanRepository::count);
        long totalWallets = safeCount(walletLimitRepository::count);

        LocalDateTime startOfMonth = LocalDate.now()
                .withDayOfMonth(1)
                .atStartOfDay();

        long newUsers = safeCount(
                () -> userRepository.countCreatedSince(startOfMonth));
        long newTransactions = safeCount(
                () -> transactionRepository.countCreatedSince(startOfMonth));

        return AdminDashboardSummaryResponse.builder()
                .totalUsers(totalUsers)
                .totalTransactions(totalTransactions)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .totalMonthlyPlans(totalMonthlyPlans)
                .totalWallets(totalWallets)
                .newUsers(newUsers)
                .newTransactions(newTransactions)
                .build();
    }

    /**
     * Returns chart data for the last 12 months.
     * Only ROLE_ADMIN is allowed.
     */
    @Transactional(readOnly = true)
    public AdminDashboardChartResponse getCharts(HttpSession session) {
        requireAdmin(session);

        LocalDateTime since = LocalDate.now()
                .minusMonths(CHART_PERIOD_MONTHS)
                .withDayOfMonth(1)
                .atStartOfDay();

        List<UserGrowthPoint> userGrowth = buildUserGrowth(since);
        List<TransactionStatisticPoint> txStats =
                buildTransactionStatistics(since);

        return AdminDashboardChartResponse.builder()
                .userGrowth(userGrowth)
                .transactionStatistics(txStats)
                .build();
    }

    // ===========================================================
    // PRIVATE HELPERS
    // ===========================================================

    private void requireAdmin(HttpSession session) {
        if (session == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Object userId = session.getAttribute("userId");
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if (!authenticationService.hasRole(session, ADMIN_ROLE)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private long safeCount(java.util.function.Supplier<Long> supplier) {
        try {
            Long value = supplier.get();
            return value != null ? value : 0L;
        } catch (Exception ex) {
            return 0L;
        }
    }

    private BigDecimal safeSum(java.util.function.Supplier<BigDecimal> supplier) {
        try {
            BigDecimal value = supplier.get();
            return value != null ? value : BigDecimal.ZERO;
        } catch (Exception ex) {
            return BigDecimal.ZERO;
        }
    }

    private List<UserGrowthPoint> buildUserGrowth(LocalDateTime since) {
        List<UserRepository.MonthlyUserAggregate> rows =
                userRepository.aggregateMonthlyCreated(since);

        Map<String, Long> byMonth = new HashMap<>();
        for (UserRepository.MonthlyUserAggregate row : rows) {
            byMonth.put(monthKey(row.getYear(), row.getMonth()),
                    row.getCount());
        }
        return fillMissingMonths(since, byMonth);
    }

    private List<TransactionStatisticPoint> buildTransactionStatistics(
            LocalDateTime since) {
        List<TransactionRepository.MonthlyTypeAggregate> rows =
                transactionRepository.aggregateMonthlyByType(since);

        Map<String, BigDecimal[]> byMonth = new HashMap<>();
        for (TransactionRepository.MonthlyTypeAggregate row : rows) {
            byMonth.put(monthKey(row.getYear(), row.getMonth()),
                    new BigDecimal[] {
                            nz(row.getIncome()),
                            nz(row.getExpense())
                    });
        }

        List<TransactionStatisticPoint> points = new ArrayList<>();
        LocalDate cursor = LocalDate.now().withDayOfMonth(1);
        LocalDate start = since.toLocalDate().withDayOfMonth(1);

        while (!cursor.isBefore(start)) {
            String key = monthKey(cursor.getYear(), cursor.getMonthValue());
            BigDecimal[] vals = byMonth.getOrDefault(key,
                    new BigDecimal[] { BigDecimal.ZERO, BigDecimal.ZERO });
            points.add(TransactionStatisticPoint.builder()
                    .label(formatMonth(cursor))
                    .income(vals[0])
                    .expense(vals[1])
                    .build());
            cursor = cursor.minusMonths(1);
        }
        return points;
    }

    private List<UserGrowthPoint> fillMissingMonths(
            LocalDateTime since,
            Map<String, Long> byMonth) {
        List<UserGrowthPoint> points = new ArrayList<>();
        LocalDate cursor = LocalDate.now().withDayOfMonth(1);
        LocalDate start = since.toLocalDate().withDayOfMonth(1);

        while (!cursor.isBefore(start)) {
            String key = monthKey(cursor.getYear(), cursor.getMonthValue());
            long count = byMonth.getOrDefault(key, 0L);
            points.add(UserGrowthPoint.builder()
                    .label(formatMonth(cursor))
                    .count(count)
                    .build());
            cursor = cursor.minusMonths(1);
        }
        return points;
    }

    private static String monthKey(int year, int month) {
        return String.format("%04d-%02d", year, month);
    }

    private static String formatMonth(LocalDate date) {
        return String.format("T%d/%02d",
                date.getMonthValue(), date.getYear() % 100);
    }

    private static BigDecimal nz(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
