package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.Admin.SystemConfigResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.UpdateSystemConfigRequest;
import com.kakeipocket.KakeiPocket.entity.SystemConfig;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.repository.SystemConfigRepository;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private static final String ADMIN_ROLE = "ADMIN";

    private static final int DEFAULT_WARNING_THRESHOLD = 80;
    private static final int DEFAULT_DANGER_THRESHOLD = 100;

    private final SystemConfigRepository systemConfigRepository;
    private final AuthenticationService authenticationService;

    @Transactional
    public SystemConfigResponse getConfig() {
        return toResponse(getOrCreateConfig());
    }

    @Transactional
    public SystemConfigResponse updateConfig(
            HttpSession session,
            UpdateSystemConfigRequest request
    ) {
        requireAdmin(session);

        if (request == null
                || request.getWarningThreshold() == null
                || request.getDangerThreshold() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        validateThresholds(
                request.getWarningThreshold(),
                request.getDangerThreshold());

        SystemConfig config = getOrCreateConfig();
        config.setWarningThreshold(request.getWarningThreshold());
        config.setDangerThreshold(request.getDangerThreshold());
        config.setUpdatedAt(LocalDateTime.now());

        SystemConfig saved = systemConfigRepository.save(config);
        return toResponse(saved);
    }

    /**
     * Read-only accessor used by other services (e.g. WalletAlertService).
     * Returns the persisted config, creating a default one if absent.
     */
    @Transactional
    public SystemConfig getActiveConfig() {
        return getOrCreateConfig();
    }

    @Transactional
    public SystemConfig getOrCreateConfig() {
        return systemConfigRepository
                .findFirstByOrderByIdAsc()
                .orElseGet(this::createDefault);
    }

    private SystemConfig createDefault() {
        SystemConfig fresh = SystemConfig.builder()
                .warningThreshold(DEFAULT_WARNING_THRESHOLD)
                .dangerThreshold(DEFAULT_DANGER_THRESHOLD)
                .updatedAt(LocalDateTime.now())
                .build();
        return systemConfigRepository.save(fresh);
    }

    private void validateThresholds(
            int warningThreshold,
            int dangerThreshold
    ) {
        if (warningThreshold >= dangerThreshold) {
            throw new AppException(ErrorCode.INVALID_THRESHOLD);
        }
    }

    private void requireAdmin(HttpSession session) {
        if (session == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        Object userId = session.getAttribute("userId");
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        if (!authenticationService.hasRole(session, ADMIN_ROLE)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }
    }

    private SystemConfigResponse toResponse(SystemConfig config) {
        return SystemConfigResponse.builder()
                .warningThreshold(config.getWarningThreshold())
                .dangerThreshold(config.getDangerThreshold())
                .build();
    }
}
