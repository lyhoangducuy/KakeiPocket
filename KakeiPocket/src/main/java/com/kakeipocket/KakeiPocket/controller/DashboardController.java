package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Dashboard.DashboardResponse;
import com.kakeipocket.KakeiPocket.services.DashboardService;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(
        level = lombok.AccessLevel.PRIVATE,
        makeFinal = true
)
@RequestMapping("/api/dashboard")
public class DashboardController {

    DashboardService dashboardService;

    @GetMapping
    public ApiResponse<DashboardResponse> getDashboard(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpSession session
    ) {
        return ApiResponse
                .<DashboardResponse>builder()
                .code(1000)
                .message("Get dashboard successfully")
                .result(
                        dashboardService.getDashboard(
                                (Long) session.getAttribute("userId"),
                                year,
                                month
                        )
                )
                .build();
    }
}