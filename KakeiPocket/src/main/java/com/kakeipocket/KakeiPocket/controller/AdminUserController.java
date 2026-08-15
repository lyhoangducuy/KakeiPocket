package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminUserDetailResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminUserResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminUserStatusRequest;
import com.kakeipocket.KakeiPocket.dto.PageResponse;
import com.kakeipocket.KakeiPocket.enums.UserStatus;
import com.kakeipocket.KakeiPocket.services.AdminUserService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/admin/users")
public class AdminUserController {

    AdminUserService adminUserService;

    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> getUsers(
            HttpSession session,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDirection
    ) {
        return ApiResponse.<PageResponse<AdminUserResponse>>builder()
                .code(1000)
                .message("Get users successfully")
                .result(
                        adminUserService.getUsers(
                                session,
                                page, size,
                                keyword, role, status,
                                sortBy, sortDirection)
                )
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminUserDetailResponse> getUserDetail(
            HttpSession session,
            @PathVariable Long id
    ) {
        return ApiResponse.<AdminUserDetailResponse>builder()
                .code(1000)
                .message("Get user detail successfully")
                .result(
                        adminUserService.getUserDetail(session, id)
                )
                .build();
    }

    @PatchMapping("/{id}/status")
    public ApiResponse<AdminUserResponse> updateUserStatus(
            HttpSession session,
            @PathVariable Long id,
            @RequestBody @Valid AdminUserStatusRequest request
    ) {
        return ApiResponse.<AdminUserResponse>builder()
                .code(1000)
                .message("Update user status successfully")
                .result(
                        adminUserService.updateUserStatus(
                                session, id, request)
                )
                .build();
    }
}
