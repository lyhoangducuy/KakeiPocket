package com.kakeipocket.KakeiPocket.dto.Admin;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class UpdateSystemConfigRequest {

    @NotNull
    @Min(value = 1, message = "Warning threshold must be greater than 0")
    @Max(value = 99, message = "Warning threshold must be less than 100")
    Integer warningThreshold;

    @NotNull
    @Min(value = 1, message = "Danger threshold must be greater than 0")
    @Max(value = 100, message = "Danger threshold must be at most 100")
    Integer dangerThreshold;
}
