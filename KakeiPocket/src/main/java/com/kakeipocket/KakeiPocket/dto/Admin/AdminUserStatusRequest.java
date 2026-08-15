package com.kakeipocket.KakeiPocket.dto.Admin;

import com.kakeipocket.KakeiPocket.enums.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class AdminUserStatusRequest {
    @NotNull
    UserStatus status;
}
