package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.SystemConfigResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.UpdateSystemConfigRequest;
import com.kakeipocket.KakeiPocket.services.SystemConfigService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/admin/system-config")
public class AdminSystemConfigController {

    SystemConfigService systemConfigService;

    @GetMapping
    public ApiResponse<SystemConfigResponse> getSystemConfig() {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(1000)
                .message("Get system configuration successfully")
                .result(systemConfigService.getConfig())
                .build();
    }

    @PutMapping
    public ApiResponse<SystemConfigResponse> updateSystemConfig(
            HttpSession session,
            @RequestBody @Valid UpdateSystemConfigRequest request
    ) {
        return ApiResponse.<SystemConfigResponse>builder()
                .code(1000)
                .message("Update system configuration successfully")
                .result(systemConfigService.updateConfig(session, request))
                .build();
    }
}
