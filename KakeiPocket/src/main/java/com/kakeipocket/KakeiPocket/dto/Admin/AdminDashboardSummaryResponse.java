package com.kakeipocket.KakeiPocket.dto.Admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AdminDashboardSummaryResponse {
    long totalUsers;
    long totalTransactions;
    BigDecimal totalIncome;
    BigDecimal totalExpense;
    long totalMonthlyPlans;
    long totalWallets;
    long newUsers;
    long newTransactions;
}
