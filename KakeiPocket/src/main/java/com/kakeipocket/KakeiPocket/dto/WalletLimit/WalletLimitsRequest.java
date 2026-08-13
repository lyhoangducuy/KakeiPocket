package com.kakeipocket.KakeiPocket.dto.WalletLimit;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WalletLimitsRequest {

    @NotNull(message = "Hạn mức thiết yếu không được để trống")
    @PositiveOrZero(message = "Hạn mức không thể nhỏ hơn 0")
    private BigDecimal necessary;

    @NotNull(message = "Hạn mức mong muốn không được để trống")
    @PositiveOrZero(message = "Hạn mức không thể nhỏ hơn 0")
    private BigDecimal wants;

    @NotNull(message = "Hạn mức tinh thần không được để trống")
    @PositiveOrZero(message = "Hạn mức không thể nhỏ hơn 0")
    private BigDecimal culture;

    @NotNull(message = "Hạn mức phát sinh không được để trống")
    @PositiveOrZero(message = "Hạn mức không thể nhỏ hơn 0")
    private BigDecimal unexpected;
}
