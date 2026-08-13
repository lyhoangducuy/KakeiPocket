package com.kakeipocket.KakeiPocket.dto.Dashboard;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncomeSummaryResponse {
    private BigDecimal total;
    private BigDecimal target;
    private Double progress;
}