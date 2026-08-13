package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletSummaryResponse {
    private Integer totalWarningWallets;
    private Integer totalExceededWallets;
    private Boolean hasBudgetAlert;
}