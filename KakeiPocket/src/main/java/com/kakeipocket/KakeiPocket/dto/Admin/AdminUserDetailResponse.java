package com.kakeipocket.KakeiPocket.dto.Admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AdminUserDetailResponse {
    Long id;
    String fullName;
    String email;
    String role;
    String status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UserStatistics statistics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = lombok.AccessLevel.PRIVATE)
    public static class UserStatistics {
        long totalTransactions;
        BigDecimal totalIncome;
        BigDecimal totalExpense;
        long totalMonthlyPlans;
    }
}
