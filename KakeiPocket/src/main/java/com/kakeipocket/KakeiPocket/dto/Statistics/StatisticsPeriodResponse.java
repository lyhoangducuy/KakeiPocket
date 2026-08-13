package com.kakeipocket.KakeiPocket.dto.Statistics;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsPeriodResponse {
    private String from;
    private String to;
    private String mode;
}