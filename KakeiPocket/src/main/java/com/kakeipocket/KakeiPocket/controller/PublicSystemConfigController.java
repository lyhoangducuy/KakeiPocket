package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.SystemConfigResponse;
import com.kakeipocket.KakeiPocket.services.SystemConfigService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/system-config")
public class PublicSystemConfigController {

    SystemConfigService systemConfigService;

    /**
     * Public read-only endpoint for users (and guests).
     * Returns only the threshold values needed by the UI.
     */
    @GetMapping("/budget-thresholds")
    public ApiResponse<SystemConfigResponse> getBudgetThresholds() {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(1000)
                .message("Get budget thresholds successfully")
                .result(systemConfigService.getConfig())
                .build();
    }
}
