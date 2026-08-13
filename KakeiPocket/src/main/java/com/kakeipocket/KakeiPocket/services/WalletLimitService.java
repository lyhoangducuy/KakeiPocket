package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.dto.WalletLimit.WalletLimitsRequest;
import com.kakeipocket.KakeiPocket.dto.WalletLimit.WalletLimitsResponse;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.entity.WalletLimit;
import com.kakeipocket.KakeiPocket.enums.WalletType;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;
import com.kakeipocket.KakeiPocket.repository.WalletLimitRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WalletLimitService {

    private final WalletLimitRepository walletLimitRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public WalletLimitsResponse getWalletLimits(
            Long userId,
            Long planId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MonthlyPlan plan = monthlyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Monthly plan not found"));

        if (!plan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have permission to access this plan");
        }

        List<WalletLimit> limits = walletLimitRepository.findByMonthlyPlan(plan);

        Map<WalletType, BigDecimal> limitMap = new HashMap<>();
        for (WalletLimit limit : limits) {
            limitMap.put(limit.getWalletType(), limit.getLimitAmount());
        }

        return WalletLimitsResponse.builder()
                .necessary(getOrDefault(limitMap, WalletType.NECESSARY))
                .wants(getOrDefault(limitMap, WalletType.WANTS))
                .culture(getOrDefault(limitMap, WalletType.CULTURE))
                .unexpected(getOrDefault(limitMap, WalletType.UNEXPECTED))
                .build();
    }

    @Transactional
    public WalletLimitsResponse saveWalletLimits(
            Long userId,
            Long planId,
            WalletLimitsRequest request
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        MonthlyPlan plan = monthlyPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Monthly plan not found"));

        if (!plan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You do not have permission to update this plan");
        }

        saveOrUpdate(plan, WalletType.NECESSARY, request.getNecessary());
        saveOrUpdate(plan, WalletType.WANTS, request.getWants());
        saveOrUpdate(plan, WalletType.CULTURE, request.getCulture());
        saveOrUpdate(plan, WalletType.UNEXPECTED, request.getUnexpected());

        return getWalletLimits(userId, planId);
    }

    private void saveOrUpdate(
            MonthlyPlan plan,
            WalletType walletType,
            BigDecimal amount
    ) {
        WalletLimit limit = walletLimitRepository
                .findByMonthlyPlanAndWalletType(plan, walletType)
                .orElse(null);

        if (limit == null) {
            limit = WalletLimit.builder()
                    .monthlyPlan(plan)
                    .walletType(walletType)
                    .limitAmount(amount)
                    .build();
        } else {
            limit.setLimitAmount(amount);
        }

        walletLimitRepository.save(limit);
    }

    private BigDecimal getOrDefault(
            Map<WalletType, BigDecimal> map,
            WalletType type
    ) {
        return map.getOrDefault(type, BigDecimal.ZERO);
    }
}
