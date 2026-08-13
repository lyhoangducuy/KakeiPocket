package com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Request;

import java.math.BigDecimal;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMonthlyPlanRequest {

    @Min(1)
    @Max(12)
    private Integer month;

    private Integer year;

    private BigDecimal incomeTarget;

    private BigDecimal savingTarget;

    private String note;
}