package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import java.math.BigDecimal;

import com.kakeipocket.KakeiPocket.enums.WalletType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopWalletResponse {
    private WalletType walletType;
    private BigDecimal amount;
    private BigDecimal percentage;
}