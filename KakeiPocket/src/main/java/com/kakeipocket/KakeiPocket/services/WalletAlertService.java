package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.WalletAlert.WalletAlertResponse;
import com.kakeipocket.KakeiPocket.dto.WalletAlert.WalletAlertSummaryResponse;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.entity.WalletLimit;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletAlertStatus;
import com.kakeipocket.KakeiPocket.enums.WalletType;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;
import com.kakeipocket.KakeiPocket.repository.WalletLimitRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletAlertService {

    private static final double WARNING_THRESHOLD = 80.0;
    private static final double EXCEEDED_THRESHOLD = 100.0;
    private static final int MIN_MONTH = 1;
    private static final int MAX_MONTH = 12;
    private static final int MIN_YEAR = 1970;
    private static final int MAX_YEAR = 9999;

    private static final List<WalletType> ALERT_WALLET_TYPES = Arrays.asList(
            WalletType.NECESSARY,
            WalletType.WANTS,
            WalletType.CULTURE,
            WalletType.UNEXPECTED
    );

    private final TransactionRepository transactionRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final WalletLimitRepository walletLimitRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public WalletAlertSummaryResponse getWalletAlerts(
            Long userId,
            Integer year,
            Integer month
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        YearMonth targetMonth = resolveYearMonth(year, month);
        LocalDate from = targetMonth.atDay(1);
        LocalDate to = targetMonth.atEndOfMonth();

        Optional<MonthlyPlan> planOpt = monthlyPlanRepository
                .findByUserAndMonthAndYear(
                        user, targetMonth.getMonthValue(), targetMonth.getYear()
                );

        Map<WalletType, BigDecimal> limitByWallet = new HashMap<>();
        if (planOpt.isPresent()) {
            for (WalletLimit limit : walletLimitRepository
                    .findByMonthlyPlan(planOpt.get())) {
                if (limit.getWalletType() != null
                        && ALERT_WALLET_TYPES.contains(limit.getWalletType())) {
                    limitByWallet.put(
                            limit.getWalletType(),
                            limit.getLimitAmount() != null
                                    ? limit.getLimitAmount()
                                    : BigDecimal.ZERO
                    );
                }
            }
        }

        Map<WalletType, BigDecimal> spentByWallet = new HashMap<>();
        for (TransactionRepository.WalletAggregate agg : transactionRepository
                .aggregateExpenseByWallet(
                        user, TransactionType.EXPENSE, from, to
                )) {
            if (agg.getWalletType() != null
                    && ALERT_WALLET_TYPES.contains(agg.getWalletType())) {
                spentByWallet.put(agg.getWalletType(), agg.getTotalAmount());
            }
        }

        List<WalletAlertResponse> alerts = ALERT_WALLET_TYPES.stream()
                .map(walletType -> buildAlert(
                        walletType,
                        limitByWallet.getOrDefault(walletType, BigDecimal.ZERO),
                        spentByWallet.getOrDefault(walletType, BigDecimal.ZERO)
                ))
                .sorted(alertComparator())
                .collect(Collectors.toList());

        int totalAlerts = (int) alerts.stream()
                .filter(a -> a.getStatus() != WalletAlertStatus.NORMAL)
                .count();

        boolean hasWarning = alerts.stream()
                .anyMatch(a -> a.getStatus() == WalletAlertStatus.WARNING
                        || a.getStatus() == WalletAlertStatus.EXCEEDED);

        boolean hasExceeded = alerts.stream()
                .anyMatch(a -> a.getStatus() == WalletAlertStatus.EXCEEDED);

        return WalletAlertSummaryResponse.builder()
                .year(targetMonth.getYear())
                .month(targetMonth.getMonthValue())
                .totalAlerts(totalAlerts)
                .hasWarning(hasWarning)
                .hasExceeded(hasExceeded)
                .hasWalletConfig(planOpt.isPresent()
                        && !limitByWallet.isEmpty())
                .wallets(alerts)
                .build();
    }

    private WalletAlertResponse buildAlert(
            WalletType walletType,
            BigDecimal limit,
            BigDecimal spent
    ) {
        BigDecimal remaining = limit.subtract(spent);
        BigDecimal usagePercentage = calculatePercentage(spent, limit);
        BigDecimal exceededAmount = spent.compareTo(limit) > 0
                ? spent.subtract(limit)
                : BigDecimal.ZERO;
        WalletAlertStatus status = determineStatus(spent, limit);

        return WalletAlertResponse.builder()
                .walletType(walletType)
                .limit(limit)
                .spent(spent)
                .remaining(remaining)
                .usagePercentage(usagePercentage)
                .status(status)
                .exceededAmount(exceededAmount)
                .build();
    }

    private WalletAlertStatus determineStatus(
            BigDecimal spent,
            BigDecimal limit
    ) {
        if (limit.compareTo(BigDecimal.ZERO) <= 0) {
            if (spent.compareTo(BigDecimal.ZERO) > 0) {
                return WalletAlertStatus.EXCEEDED;
            }
            return WalletAlertStatus.NORMAL;
        }

        BigDecimal ratio = spent
                .multiply(BigDecimal.valueOf(100))
                .divide(limit, 4, RoundingMode.HALF_UP);

        double pct = ratio.doubleValue();
        if (pct >= EXCEEDED_THRESHOLD) {
            return WalletAlertStatus.EXCEEDED;
        }
        if (pct >= WARNING_THRESHOLD) {
            return WalletAlertStatus.WARNING;
        }
        return WalletAlertStatus.NORMAL;
    }

    private BigDecimal calculatePercentage(
            BigDecimal spent,
            BigDecimal limit
    ) {
        if (limit.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        if (spent.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return spent
                .multiply(BigDecimal.valueOf(100))
                .divide(limit, 2, RoundingMode.HALF_UP);
    }

    private Comparator<WalletAlertResponse> alertComparator() {
        return Comparator
                .comparingInt((WalletAlertResponse a) ->
                        statusOrder(a.getStatus()))
                .thenComparing(
                        Comparator.comparing(
                                WalletAlertResponse::getUsagePercentage
                        ).reversed()
                );
    }

    private int statusOrder(WalletAlertStatus status) {
        return switch (status) {
            case EXCEEDED -> 0;
            case WARNING -> 1;
            case NORMAL -> 2;
        };
    }

    private YearMonth resolveYearMonth(Integer year, Integer month) {
        int resolvedYear = (year != null) ? year : LocalDate.now().getYear();
        int resolvedMonth = (month != null) ? month : LocalDate.now().getMonthValue();

        if (resolvedMonth < MIN_MONTH || resolvedMonth > MAX_MONTH) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        if (resolvedYear < MIN_YEAR || resolvedYear > MAX_YEAR) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        return YearMonth.of(resolvedYear, resolvedMonth);
    }
}