package com.kakeipocket.KakeiPocket.dto.MonthlySummary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlySummaryPeriodResponse {
    private Integer year;
    private Integer month;
    private String from;
    private String to;
}