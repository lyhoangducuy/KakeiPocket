package com.kakeipocket.KakeiPocket.dto.Dashboard;

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
public class WalletSummaryResponse {
    private WalletType walletType;
    private BigDecimal limit;
    private BigDecimal spent;
    private BigDecimal remaining;
    private Double percentage;
}