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
public class TopExpenseCategoryResponse {
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private BigDecimal percentage;
}