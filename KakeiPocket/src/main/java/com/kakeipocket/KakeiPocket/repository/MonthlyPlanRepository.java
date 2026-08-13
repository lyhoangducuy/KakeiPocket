package com.kakeipocket.KakeiPocket.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.User;

public interface MonthlyPlanRepository extends JpaRepository<MonthlyPlan, Long> {

    Optional<MonthlyPlan> findByUserAndMonthAndYear(
            User user,
            Integer month,
            Integer year
    );

    boolean existsByUserAndMonthAndYear(
            User user,
            Integer month,
            Integer year
    );
}
