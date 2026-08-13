package com.kakeipocket.KakeiPocket.dto.WalletAlert;

import java.math.BigDecimal;

import com.kakeipocket.KakeiPocket.enums.WalletAlertStatus;
import com.kakeipocket.KakeiPocket.enums.WalletType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletAlertResponse {
    private WalletType walletType;
    private BigDecimal limit;
    private BigDecimal spent;
    private BigDecimal remaining;
    private BigDecimal usagePercentage;
    private WalletAlertStatus status;
    private BigDecimal exceededAmount;
}