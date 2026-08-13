package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Category.CategoryResponse;
import com.kakeipocket.KakeiPocket.dto.Category.CreateCategoryRequest;
import com.kakeipocket.KakeiPocket.dto.Category.UpdateCategoryRequest;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.services.CategoryService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(
        level = lombok.AccessLevel.PRIVATE,
        makeFinal = true
)
@RequestMapping("/api/categories")
public class CategoryController {

    CategoryService categoryService;

    @GetMapping
    public ApiResponse<List<CategoryResponse>> getCategories(
            @RequestParam(required = false) TransactionType type,
            HttpSession session
    ) {
        Long userId = (Long) session.getAttribute("userId");

        List<CategoryResponse> categories;
        if (type != null) {
            categories = categoryService.getCategoriesByType(userId, type);
        } else {
            categories = categoryService.getAllCategories(userId);
        }

        return ApiResponse
                .<List<CategoryResponse>>builder()
                .code(1000)
                .message("Get categories successfully")
                .result(categories)
                .build();
    }

    @PostMapping
    public ApiResponse<CategoryResponse> createCategory(
            @RequestBody @Valid CreateCategoryRequest request,
            HttpSession session
    ) {
        return ApiResponse
                .<CategoryResponse>builder()
                .code(1000)
                .message("Create category successfully")
                .result(
                        categoryService.createCategory(
                                (Long) session.getAttribute("userId"),
                                request
                        )
                )
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<CategoryResponse> updateCategory(
            @PathVariable Long id,
            @RequestBody @Valid UpdateCategoryRequest request,
            HttpSession session
    ) {
        return ApiResponse
                .<CategoryResponse>builder()
                .code(1000)
                .message("Update category successfully")
                .result(
                        categoryService.updateCategory(
                                (Long) session.getAttribute("userId"),
                                id,
                                request
                        )
                )
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(
            @PathVariable Long id,
            HttpSession session
    ) {
        categoryService.deleteCategory(
                (Long) session.getAttribute("userId"),
                id
        );

        return ApiResponse
                .<Void>builder()
                .code(1000)
                .message("Delete category successfully")
                .result(null)
                .build();
    }
}
