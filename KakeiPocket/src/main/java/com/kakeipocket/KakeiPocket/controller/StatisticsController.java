package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Statistics.StatisticsResponse;
import com.kakeipocket.KakeiPocket.services.StatisticsService;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequiredArgsConstructor
@FieldDefaults(
        level = lombok.AccessLevel.PRIVATE,
        makeFinal = true
)
@RequestMapping("/api/statistics")
public class StatisticsController {

    StatisticsService statisticsService;

    @GetMapping
    public ApiResponse<StatisticsResponse> getStatistics(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpSession session
    ) {
        return ApiResponse
                .<StatisticsResponse>builder()
                .code(1000)
                .message("Get statistics successfully")
                .result(
                        statisticsService.getStatistics(
                                (Long) session.getAttribute("userId"),
                                year,
                                month,
                                from,
                                to
                        )
                )
                .build();
    }
}