package com.kakeipocket.KakeiPocket.dto.Authentication.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifyOtpRequestDTO {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email")
    private String email;

    @NotBlank(message = "OTP is required")
    @Pattern(
        regexp = "^\\d{6}$",
        message = "OTP must contain 6 digits"
    )
    private String otp;
}