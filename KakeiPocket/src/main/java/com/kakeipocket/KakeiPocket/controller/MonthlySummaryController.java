package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.MonthlySummary.MonthlySummaryResponse;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.services.MonthlySummaryService;

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
@RequestMapping("/api/monthly-summary")
public class MonthlySummaryController {

    MonthlySummaryService monthlySummaryService;

    @GetMapping
    public ApiResponse<MonthlySummaryResponse> getMonthlySummary(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("userId");
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return ApiResponse.success(
                monthlySummaryService.getMonthlySummary(userId, year, month)
        );
    }
}