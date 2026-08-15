package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminCategoryResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.CreateAdminCategoryRequest;
import com.kakeipocket.KakeiPocket.dto.Admin.UpdateAdminCategoryRequest;
import com.kakeipocket.KakeiPocket.dto.PageResponse;
import com.kakeipocket.KakeiPocket.entity.Category;
import com.kakeipocket.KakeiPocket.entity.Role;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.repository.AuthenticationRepository;
import com.kakeipocket.KakeiPocket.repository.CategoryRepository;
import com.kakeipocket.KakeiPocket.repository.RoleRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;
import com.kakeipocket.KakeiPocket.repository.specification.CategorySpecification;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminCategoryService {

    private static final String ADMIN_ROLE = "ADMIN";
    private static final String SYSTEM_ADMIN_EMAIL =
            "system-admin@kakeipocket.local";
    private static final String SYSTEM_ROLE_NAME = "ADMIN";

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final AuthenticationRepository authenticationRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationService authenticationService;

    @Transactional(readOnly = true)
    public PageResponse<AdminCategoryResponse> getCategories(
            HttpSession session,
            int page,
            int size,
            String keyword,
            TransactionType type
    ) {
        requireAdmin(session);
        User systemUser = getOrCreateSystemUser();

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Pageable pageable = PageRequest.of(
                safePage, safeSize,
                Sort.by(Sort.Direction.ASC, "type")
                        .and(Sort.by(Sort.Direction.ASC, "name"))
        );

        Page<Category> result = categoryRepository.findAll(
                CategorySpecification.systemCategories(
                        systemUser.getId(), keyword, type),
                pageable
        );

        List<AdminCategoryResponse> items = result.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PageResponse.from(
                items,
                safePage,
                safeSize,
                result.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public AdminCategoryResponse getCategoryById(
            HttpSession session,
            Long id
    ) {
        requireAdmin(session);
        User systemUser = getOrCreateSystemUser();

        Category category = categoryRepository
                .findByIdAndUser(id, systemUser)
                .orElseThrow(() ->
                        new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!Boolean.TRUE.equals(category.getIsDefault())) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        return toResponse(category);
    }

    @Transactional
    public AdminCategoryResponse createCategory(
            HttpSession session,
            CreateAdminCategoryRequest request
    ) {
        requireAdmin(session);
        User systemUser = getOrCreateSystemUser();

        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        String trimmedName = request.getName() != null
                ? request.getName().trim()
                : "";

        if (trimmedName.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (categoryRepository.existsByUserAndNameAndType(
                systemUser, trimmedName, request.getType()
        )) {
            throw new AppException(
                    ErrorCode.CATEGORY_ALREADY_EXISTS);
        }

        Category category = Category.builder()
                .user(systemUser)
                .name(trimmedName)
                .type(request.getType())
                .icon(request.getIcon())
                .color(request.getColor())
                .isDefault(true)
                .build();

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public AdminCategoryResponse updateCategory(
            HttpSession session,
            Long id,
            UpdateAdminCategoryRequest request
    ) {
        requireAdmin(session);
        User systemUser = getOrCreateSystemUser();

        if (request == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        Category category = categoryRepository
                .findByIdAndUser(id, systemUser)
                .orElseThrow(() ->
                        new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!Boolean.TRUE.equals(category.getIsDefault())) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        String trimmedName = request.getName() != null
                ? request.getName().trim()
                : "";

        if (trimmedName.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        long usage = transactionRepository.countByCategory(id);

        // Type change blocked if in use
        if (usage > 0
                && category.getType() != request.getType()) {
            throw new AppException(
                    ErrorCode.CATEGORY_TYPE_LOCKED);
        }

        // Duplicate check (excluding self)
        if (!category.getName().equalsIgnoreCase(trimmedName)
                || category.getType() != request.getType()) {
            if (categoryRepository.existsByUserAndNameAndType(
                    systemUser, trimmedName, request.getType()
            )) {
                throw new AppException(
                        ErrorCode.CATEGORY_ALREADY_EXISTS);
            }
        }

        category.setName(trimmedName);
        category.setType(request.getType());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());

        Category saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Transactional
    public void deleteCategory(HttpSession session, Long id) {
        requireAdmin(session);
        User systemUser = getOrCreateSystemUser();

        Category category = categoryRepository
                .findByIdAndUser(id, systemUser)
                .orElseThrow(() ->
                        new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        if (!Boolean.TRUE.equals(category.getIsDefault())) {
            throw new AppException(ErrorCode.CATEGORY_NOT_FOUND);
        }

        long usage = transactionRepository.countByCategory(id);
        if (usage > 0) {
            throw new AppException(ErrorCode.CATEGORY_IN_USE);
        }

        categoryRepository.delete(category);
    }

    // ===========================================================
    // PRIVATE HELPERS
    // ===========================================================

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

    /**
     * Ensure there is a hidden "system admin" user that owns all
     * default categories. Idempotent.
     */
    private User getOrCreateSystemUser() {
        return authenticationRepository
                .findByEmail(SYSTEM_ADMIN_EMAIL)
                .orElseGet(this::createSystemUser);
    }

    private User createSystemUser() {
        Role adminRole = roleRepository
                .findByName(SYSTEM_ROLE_NAME)
                .orElseThrow(() ->
                        new RuntimeException(
                                "ADMIN role not found in database"));

        // Random unguessable password; this user only logs in via DB.
        String randomPassword = java.util.UUID
                .randomUUID()
                .toString();

        User sys = User.builder()
                .fullName("KakeiPocket System")
                .email(SYSTEM_ADMIN_EMAIL)
                .password(passwordEncoder.encode(randomPassword))
                .role(adminRole)
                .status(com.kakeipocket.KakeiPocket.enums.UserStatus.ACTIVE)
                .build();
        return userRepository.save(sys);
    }

    private AdminCategoryResponse toResponse(Category category) {
        long usage = transactionRepository.countByCategory(
                category.getId());
        return AdminCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType() != null
                        ? category.getType().name()
                        : null)
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.getIsDefault())
                .usageCount(usage)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
