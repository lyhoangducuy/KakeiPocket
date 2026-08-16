package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Authentication.Request.ForgotPasswordRequestDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Request.LoginRequestDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Request.RegisterRequestDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Request.ResetPasswordRequestDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Request.VerifyOtpRequestDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Response.LoginResponseDTO;
import com.kakeipocket.KakeiPocket.dto.Authentication.Response.RegisterResponseDTO;
import com.kakeipocket.KakeiPocket.services.AuthenticationService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/auth")
public class AuthenticationController {

        AuthenticationService authenticationService;

        // =========================
        // LOGIN
        // =========================

        @PostMapping("/login")
        public ApiResponse<LoginResponseDTO> login(
                        @RequestBody @Valid LoginRequestDTO request,
                        HttpSession session) {

                return ApiResponse.<LoginResponseDTO>builder()
                                .code(1000)
                                .message("Login successfully")
                                .result(
                                                authenticationService.login(
                                                                request,
                                                                session))
                                .build();
        }

        // =========================
        // REGISTER
        // =========================

        @PostMapping("/register")
        public ApiResponse<RegisterResponseDTO> register(
                        @RequestBody @Valid RegisterRequestDTO request) {

                return ApiResponse.<RegisterResponseDTO>builder()
                                .code(1000)
                                .message("Register successfully")
                                .result(
                                                authenticationService.register(
                                                                request))
                                .build();
        }

        // =========================
        // LOGOUT
        // =========================

        @PostMapping("/logout")
        public ApiResponse<Void> logout(
                        HttpSession session) {

                authenticationService.logout(session);

                return ApiResponse.<Void>builder()
                                .code(1000)
                                .message("Logout successfully")
                                .build();
        }

        // =========================
        // FORGOT PASSWORD
        // =========================

        // =========================
        // RESET PASSWORD
        // =========================

        @PostMapping("/forgot-password")
        public ApiResponse<Void> forgotPassword(
                        @RequestBody @Valid ForgotPasswordRequestDTO request) {

                authenticationService.forgotPassword(
                                request.getEmail());

                return ApiResponse.<Void>builder()
                                .code(1000)
                                .message(
                                                "OTP has been sent if the email exists")
                                .build();
        }
        @PostMapping("/verify-otp")
        public ApiResponse<Void> verifyOtp(
                        @RequestBody @Valid VerifyOtpRequestDTO request) {

                authenticationService.verifyOtp(
                                request.getEmail(),
                                request.getOtp());

                return ApiResponse.<Void>builder()
                                .code(1000)
                                .message("OTP verified successfully")
                                .build();
        }

        @PostMapping("/reset-password")
        public ApiResponse<Void> resetPassword(
                        @RequestBody @Valid ResetPasswordRequestDTO request) {

                authenticationService.resetPassword(
                                request.getEmail(),
                                request.getNewPassword(),
                                request.getConfirmPassword());

                return ApiResponse.<Void>builder()
                                .code(1000)
                                .message("Password reset successfully")
                                .build();
        }

        @GetMapping("/me")
        public ApiResponse<LoginResponseDTO> getCurrentUser(
                        HttpSession session) {

                return ApiResponse.<LoginResponseDTO>builder()
                                .code(1000)
                                .message("Get current user successfully")
                                .result(
                                                authenticationService
                                                                .getCurrentUser(session))
                                .build();
        }
}