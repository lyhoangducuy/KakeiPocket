package com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class MonthlyPlanResponse {

    private Long id;

    private Integer month;

    private Integer year;

    private BigDecimal incomeTarget;

    private BigDecimal savingTarget;

    private String note;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}