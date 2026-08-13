package com.kakeipocket.KakeiPocket.services;


import com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Request.CreateMonthlyPlanRequest;
import com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Request.UpdateMonthlyPlanRequest;
import com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Response.MonthlyPlanResponse;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class MonthlyPlanService {

    private final MonthlyPlanRepository monthlyPlanRepository;
    private final UserRepository userRepository;

    /**
     * Tạo kế hoạch tháng
     */
    @Transactional
    public MonthlyPlanResponse createPlan(
            Long userId,
            CreateMonthlyPlanRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        if (monthlyPlanRepository.existsByUserAndMonthAndYear(
                user,
                request.getMonth(),
                request.getYear()
        )) {
            throw new RuntimeException(
                    "Monthly plan already exists for this month"
            );
        }

        MonthlyPlan plan = MonthlyPlan.builder()
                .user(user)
                .month(request.getMonth())
                .year(request.getYear())
                .incomeTarget(request.getIncomeTarget())
                .savingTarget(request.getSavingTarget())
                .note(request.getNote())
                .build();

        MonthlyPlan savedPlan =
                monthlyPlanRepository.save(plan);

        return toResponse(savedPlan);
    }

    /**
     * Lấy kế hoạch tháng hiện tại
     */
    @Transactional(readOnly = true)
    public MonthlyPlanResponse getCurrentPlan(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        LocalDate now = LocalDate.now();

        MonthlyPlan plan =
                monthlyPlanRepository
                        .findByUserAndMonthAndYear(
                                user,
                                now.getMonthValue(),
                                now.getYear()
                        )
                        .orElse(null);

        if (plan == null) {
            return null;
        }

        return toResponse(plan);
    }

    /**
     * Cập nhật kế hoạch
     */
    @Transactional
    public MonthlyPlanResponse updatePlan(
            Long userId,
            Long planId,
            UpdateMonthlyPlanRequest request
    ) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        MonthlyPlan plan =
                monthlyPlanRepository.findById(planId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Monthly plan not found"
                                )
                        );

        // Quan trọng: không cho user sửa plan của user khác
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new RuntimeException(
                    "You do not have permission to update this plan"
            );
        }

        if (request.getMonth() != null) {
            plan.setMonth(request.getMonth());
        }

        if (request.getYear() != null) {
            plan.setYear(request.getYear());
        }

        if (request.getIncomeTarget() != null) {
            plan.setIncomeTarget(request.getIncomeTarget());
        }

        if (request.getSavingTarget() != null) {
            plan.setSavingTarget(request.getSavingTarget());
        }

        if (request.getNote() != null) {
            plan.setNote(request.getNote());
        }

        MonthlyPlan updatedPlan =
                monthlyPlanRepository.save(plan);

        return toResponse(updatedPlan);
    }

    private MonthlyPlanResponse toResponse(MonthlyPlan plan) {

        return MonthlyPlanResponse.builder()
                .id(plan.getId())
                .month(plan.getMonth())
                .year(plan.getYear())
                .incomeTarget(plan.getIncomeTarget())
                .savingTarget(plan.getSavingTarget())
                .note(plan.getNote())
                .createdAt(plan.getCreatedAt())
                .updatedAt(plan.getUpdatedAt())
                .build();
    }
}