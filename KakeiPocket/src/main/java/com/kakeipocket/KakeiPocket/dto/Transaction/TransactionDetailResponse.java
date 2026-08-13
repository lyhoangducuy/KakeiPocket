package com.kakeipocket.KakeiPocket.dto.Transaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDetailResponse {

    private Long id;
    private TransactionType type;
    private Long categoryId;
    private String categoryName;
    private WalletType walletType;
    private BigDecimal amount;
    private String transactionDate;
    private String note;
    private String createdAt;
    private String updatedAt;
}