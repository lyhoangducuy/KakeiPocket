package com.kakeipocket.KakeiPocket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.WalletLimit;
import com.kakeipocket.KakeiPocket.enums.WalletType;

public interface WalletLimitRepository extends JpaRepository<WalletLimit, Long> {

    List<WalletLimit> findByMonthlyPlan(MonthlyPlan monthlyPlan);

    Optional<WalletLimit> findByMonthlyPlanAndWalletType(
            MonthlyPlan monthlyPlan,
            WalletType walletType
    );

    boolean existsByMonthlyPlanAndWalletType(
            MonthlyPlan monthlyPlan,
            WalletType walletType
    );
}
