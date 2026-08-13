package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.WalletLimit.WalletLimitsRequest;
import com.kakeipocket.KakeiPocket.dto.WalletLimit.WalletLimitsResponse;
import com.kakeipocket.KakeiPocket.services.WalletLimitService;

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
@RequestMapping("/api/monthly-plans/{planId}/wallets")
public class WalletLimitController {

    WalletLimitService walletLimitService;

    @GetMapping
    public ApiResponse<WalletLimitsResponse> getWalletLimits(
            @PathVariable Long planId,
            HttpSession session
    ) {
        return ApiResponse
                .<WalletLimitsResponse>builder()
                .code(1000)
                .message("Get wallet limits successfully")
                .result(
                        walletLimitService.getWalletLimits(
                                (Long) session.getAttribute("userId"),
                                planId
                        )
                )
                .build();
    }

    @PutMapping
    public ApiResponse<WalletLimitsResponse> saveWalletLimits(
            @PathVariable Long planId,
            @RequestBody @Valid WalletLimitsRequest request,
            HttpSession session
    ) {
        return ApiResponse
                .<WalletLimitsResponse>builder()
                .code(1000)
                .message("Save wallet limits successfully")
                .result(
                        walletLimitService.saveWalletLimits(
                                (Long) session.getAttribute("userId"),
                                planId,
                                request
                        )
                )
                .build();
    }
}
