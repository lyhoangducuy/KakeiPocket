package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminCategoryResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.CreateAdminCategoryRequest;
import com.kakeipocket.KakeiPocket.dto.Admin.UpdateAdminCategoryRequest;
import com.kakeipocket.KakeiPocket.dto.PageResponse;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.services.AdminCategoryService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/admin/categories")
public class AdminCategoryController {

    AdminCategoryService adminCategoryService;

    @GetMapping
    public ApiResponse<PageResponse<AdminCategoryResponse>> getCategories(
            HttpSession session,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) TransactionType type
    ) {
        return ApiResponse
                .<PageResponse<AdminCategoryResponse>>builder()
                .code(1000)
                .message("Get system categories successfully")
                .result(
                        adminCategoryService.getCategories(
                                session, page, size, keyword, type)
                )
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<AdminCategoryResponse> getCategoryById(
            HttpSession session,
            @PathVariable Long id
    ) {
        return ApiResponse.<AdminCategoryResponse>builder()
                .code(1000)
                .message("Get category detail successfully")
                .result(
                        adminCategoryService.getCategoryById(session, id)
                )
                .build();
    }

    @PostMapping
    public ApiResponse<AdminCategoryResponse> createCategory(
            HttpSession session,
            @RequestBody @Valid CreateAdminCategoryRequest request
    ) {
        return ApiResponse.<AdminCategoryResponse>builder()
                .code(1000)
                .message("Create category successfully")
                .result(
                        adminCategoryService.createCategory(
                                session, request)
                )
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<AdminCategoryResponse> updateCategory(
            HttpSession session,
            @PathVariable Long id,
            @RequestBody @Valid UpdateAdminCategoryRequest request
    ) {
        return ApiResponse.<AdminCategoryResponse>builder()
                .code(1000)
                .message("Update category successfully")
                .result(
                        adminCategoryService.updateCategory(
                                session, id, request)
                )
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(
            HttpSession session,
            @PathVariable Long id
    ) {
        adminCategoryService.deleteCategory(session, id);
        return ApiResponse.<Void>builder()
                .code(1000)
                .message("Delete category successfully")
                .build();
    }
}
