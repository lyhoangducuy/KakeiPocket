package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Request.CreateMonthlyPlanRequest;
import com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Request.UpdateMonthlyPlanRequest;
import com.kakeipocket.KakeiPocket.dto.MonthlyPlan.Response.MonthlyPlanResponse;
import com.kakeipocket.KakeiPocket.services.MonthlyPlanService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(
        level = lombok.AccessLevel.PRIVATE,
        makeFinal = true
)
@RequestMapping("/api/monthly-plans")
public class MonthlyPlanController {

    MonthlyPlanService monthlyPlanService;


    // =========================
    // CREATE MONTHLY PLAN
    // =========================

    @PostMapping
    public ApiResponse<MonthlyPlanResponse> createPlan(
            @RequestBody @Valid CreateMonthlyPlanRequest request,
            HttpSession session) {

        return ApiResponse
                .<MonthlyPlanResponse>builder()
                .code(1000)
                .message("Create monthly plan successfully")
                .result(
                        monthlyPlanService.createPlan(
                               (Long) session.getAttribute("userId"), request
                        )
                )
                .build();
    }


    // =========================
    // GET CURRENT MONTHLY PLAN
    // =========================

    @GetMapping("/current")
    public ApiResponse<MonthlyPlanResponse> getCurrentPlan(
            HttpSession session) {

        return ApiResponse
                .<MonthlyPlanResponse>builder()
                .code(1000)
                .message("Get current monthly plan successfully")
                .result(
                        monthlyPlanService.getCurrentPlan(
                                (Long)session.getAttribute("userId")
                        )
                )
                .build();
    }


    // =========================
    // UPDATE MONTHLY PLAN
    // =========================

    @PutMapping("/{id}")
    public ApiResponse<MonthlyPlanResponse> updatePlan(
            @PathVariable Long id,
            @RequestBody @Valid UpdateMonthlyPlanRequest request,
            HttpSession session) {

        return ApiResponse
                .<MonthlyPlanResponse>builder()
                .code(1000)
                .message("Update monthly plan successfully")
                .result(
                        monthlyPlanService.updatePlan(
                                (Long) session.getAttribute("userId"),
                                id,
                                request
                        )
                )
                .build();
    }
}
