package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.WalletAlert.WalletAlertSummaryResponse;
import com.kakeipocket.KakeiPocket.services.WalletAlertService;

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
@RequestMapping("/api/wallet-alerts")
public class WalletAlertController {

    WalletAlertService walletAlertService;

    @GetMapping
    public ApiResponse<WalletAlertSummaryResponse> getWalletAlerts(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            HttpSession session
    ) {
        return ApiResponse
                .<WalletAlertSummaryResponse>builder()
                .code(1000)
                .message("Get wallet alerts successfully")
                .result(
                        walletAlertService.getWalletAlerts(
                                (Long) session.getAttribute("userId"),
                                year,
                                month
                        )
                )
                .build();
    }
}