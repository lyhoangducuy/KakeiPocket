package com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateMonthlyPlanRequest {

    @NotNull
    @Min(1)
    @Max(12)
    private Integer month;

    @NotNull
    private Integer year;

    private BigDecimal incomeTarget;

    private BigDecimal savingTarget;

    private String note;
}