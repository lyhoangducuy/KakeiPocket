package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.kakeipocket.KakeiPocket.enums.WalletType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LargestExpenseResponse {
    private Long transactionId;
    private BigDecimal amount;
    private Long categoryId;
    private String categoryName;
    private WalletType walletType;
    private LocalDate date;
    private String note;
}