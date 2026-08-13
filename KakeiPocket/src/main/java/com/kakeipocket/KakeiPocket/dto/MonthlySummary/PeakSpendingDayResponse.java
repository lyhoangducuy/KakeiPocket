package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PeakSpendingDayResponse {
    private LocalDate date;
    private BigDecimal amount;
}