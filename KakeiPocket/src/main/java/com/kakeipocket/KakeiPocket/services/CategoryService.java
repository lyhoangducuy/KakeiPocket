package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.dto.Category.CategoryResponse;
import com.kakeipocket.KakeiPocket.dto.Category.CreateCategoryRequest;
import com.kakeipocket.KakeiPocket.dto.Category.UpdateCategoryRequest;
import com.kakeipocket.KakeiPocket.entity.Category;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.repository.CategoryRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories(Long userId) {
        User user = getUser(userId);
        List<Category> categories = categoryRepository.findByUser(user);
        return categories.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoriesByType(
            Long userId,
            TransactionType type
    ) {
        User user = getUser(userId);
        List<Category> categories = categoryRepository.findByUserAndType(user, type);
        return categories.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(
            Long userId,
            CreateCategoryRequest request
    ) {
        User user = getUser(userId);

        if (categoryRepository.existsByUserAndNameAndType(
                user,
                request.getName().trim(),
                request.getType()
        )) {
            throw new RuntimeException("Danh mục đã tồn tại");
        }

        Category category = Category.builder()
                .user(user)
                .name(request.getName().trim())
                .type(request.getType())
                .icon(request.getIcon())
                .color(request.getColor())
                .isDefault(false)
                .build();

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(
            Long userId,
            Long categoryId,
            UpdateCategoryRequest request
    ) {
        User user = getUser(userId);

        Category category = categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        if (categoryRepository.existsByUserAndNameAndType(
                user,
                request.getName().trim(),
                request.getType()
        )) {
            Category existing = categoryRepository
                    .findByUserAndNameAndType(user, request.getName().trim(), request.getType())
                    .orElse(null);

            if (existing != null && !existing.getId().equals(categoryId)) {
                throw new RuntimeException("Danh mục đã tồn tại");
            }
        }

        category.setName(request.getName().trim());
        category.setType(request.getType());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public void deleteCategory(Long userId, Long categoryId) {
        User user = getUser(userId);

        Category category = categoryRepository.findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại"));

        categoryRepository.delete(category);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.getIsDefault())
                .createdAt(category.getCreatedAt() != null
                        ? category.getCreatedAt().format(DATE_FORMATTER)
                        : null)
                .updatedAt(category.getUpdatedAt() != null
                        ? category.getUpdatedAt().format(DATE_FORMATTER)
                        : null)
                .build();
    }
}
