package com.kakeipocket.KakeiPocket.dto.AiFinancial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiFinancialRequest {
    private Integer year;
    private Integer month;
    private String question;
}