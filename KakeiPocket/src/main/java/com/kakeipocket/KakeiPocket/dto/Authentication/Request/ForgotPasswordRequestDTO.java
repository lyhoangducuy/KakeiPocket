package com.kakeipocket.KakeiPocket.dto.Authentication.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ForgotPasswordRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;
}
