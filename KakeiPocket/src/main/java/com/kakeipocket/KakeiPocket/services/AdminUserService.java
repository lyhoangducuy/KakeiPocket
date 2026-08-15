package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.config.AppException;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminUserDetailResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminUserDetailResponse.UserStatistics;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminUserResponse;
import com.kakeipocket.KakeiPocket.dto.Admin.AdminUserStatusRequest;
import com.kakeipocket.KakeiPocket.dto.PageResponse;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.ErrorCode;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.UserStatus;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;
import com.kakeipocket.KakeiPocket.repository.specification.UserSpecification;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private static final String ADMIN_ROLE = "ADMIN";

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final AuthenticationService authenticationService;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getUsers(
            HttpSession session,
            int page,
            int size,
            String keyword,
            String roleName,
            UserStatus status,
            String sortBy,
            String sortDirection
    ) {
        requireAdmin(session);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);

        Sort sort = resolveSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);

        Page<User> result = userRepository.findAll(
                UserSpecification.filterUsers(
                        keyword, roleName, status),
                pageable
        );

        List<AdminUserResponse> items = result.getContent().stream()
                .map(this::toUserResponse)
                .toList();

        return PageResponse.from(
                items,
                safePage,
                safeSize,
                result.getTotalElements()
        );
    }

    @Transactional(readOnly = true)
    public AdminUserDetailResponse getUserDetail(
            HttpSession session,
            Long userId
    ) {
        requireAdmin(session);

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND));

        UserStatistics stats = buildUserStatistics(user);

        return AdminUserDetailResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(roleName(user))
                .status(statusName(user))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .statistics(stats)
                .build();
    }

    @Transactional
    public AdminUserResponse updateUserStatus(
            HttpSession session,
            Long userId,
            AdminUserStatusRequest request
    ) {
        Long currentAdminId = requireAdmin(session);

        if (request == null || request.getStatus() == null) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        if (currentAdminId.equals(userId)) {
            throw new AppException(
                    ErrorCode.CANNOT_LOCK_SELF
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new AppException(ErrorCode.USER_NOT_FOUND));

        user.setStatus(request.getStatus());
        userRepository.save(user);

        return toUserResponse(user);
    }

    // ===========================================================
    // PRIVATE HELPERS
    // ===========================================================

    private Long requireAdmin(HttpSession session) {
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
        return (Long) userId;
    }

    private Sort resolveSort(String sortBy, String sortDirection) {
        String field = (sortBy == null || sortBy.isBlank())
                ? "createdAt"
                : sortBy.trim();
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDirection)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        if (!isAllowedSortField(field)) {
            field = "createdAt";
        }

        return Sort.by(direction, field);
    }

    private boolean isAllowedSortField(String field) {
        return "id".equals(field)
                || "email".equals(field)
                || "fullName".equals(field)
                || "createdAt".equals(field)
                || "updatedAt".equals(field);
    }

    private AdminUserResponse toUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(roleName(user))
                .status(statusName(user))
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    private UserStatistics buildUserStatistics(User user) {
        long totalTx = transactionRepository.countByUser(user);
        BigDecimal income = safeSum(
                () -> transactionRepository.sumByUserAndType(
                        user, TransactionType.INCOME));
        BigDecimal expense = safeSum(
                () -> transactionRepository.sumByUserAndType(
                        user, TransactionType.EXPENSE));
        long plans = monthlyPlanRepository.countByUser(user);

        return UserStatistics.builder()
                .totalTransactions(totalTx)
                .totalIncome(income)
                .totalExpense(expense)
                .totalMonthlyPlans(plans)
                .build();
    }

    private BigDecimal safeSum(java.util.function.Supplier<BigDecimal> s) {
        try {
            BigDecimal v = s.get();
            return v != null ? v : BigDecimal.ZERO;
        } catch (Exception ex) {
            return BigDecimal.ZERO;
        }
    }

    private String roleName(User user) {
        return user.getRole() != null
                ? user.getRole().getName()
                : null;
    }

    private String statusName(User user) {
        return user.getStatus() != null
                ? user.getStatus().name()
                : null;
    }
}
