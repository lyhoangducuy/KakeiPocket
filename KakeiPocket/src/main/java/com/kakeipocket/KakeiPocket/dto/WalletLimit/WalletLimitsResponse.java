package com.kakeipocket.KakeiPocket.dto.WalletLimit;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletLimitsResponse {

    private BigDecimal necessary;
    private BigDecimal wants;
    private BigDecimal culture;
    private BigDecimal unexpected;
}
