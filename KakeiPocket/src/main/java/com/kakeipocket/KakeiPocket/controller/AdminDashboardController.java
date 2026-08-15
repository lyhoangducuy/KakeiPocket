package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminDashboardChartResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminDashboardSummaryResponse;
import com.kakeipocket.KakeiPocket.services.AdminDashboardService;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    public ApiResponse<AdminDashboardSummaryResponse> getSummary(
            HttpSession session) {
        return ApiResponse.<AdminDashboardSummaryResponse>builder()
                .code(1000)
                .message("Get admin dashboard summary successfully")
                .result(adminDashboardService.getSummary(session))
                .build();
    }

    @GetMapping("/charts")
    public ApiResponse<AdminDashboardChartResponse> getCharts(
            HttpSession session) {
        return ApiResponse.<AdminDashboardChartResponse>builder()
                .code(1000)
                .message("Get admin dashboard charts successfully")
                .result(adminDashboardService.getCharts(session))
                .build();
    }
}
