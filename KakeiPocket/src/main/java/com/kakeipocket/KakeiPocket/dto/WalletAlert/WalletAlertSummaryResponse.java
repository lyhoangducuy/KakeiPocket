package com.kakeipocket.KakeiPocket.dto.WalletAlert;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletAlertSummaryResponse {
    private Integer year;
    private Integer month;
    private Integer totalAlerts;
    private Boolean hasWarning;
    private Boolean hasExceeded;
    private Boolean hasWalletConfig;
    private List<WalletAlertResponse> wallets;
}