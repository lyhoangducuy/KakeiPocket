package com.kakeipocket.KakeiPocket.enums;

import lombok.Getter;

@Getter
public enum ErrorCode {

    SUCCESS(
            1000,
            "Success"
    ),

    INVALID_REQUEST(
            1001,
            "Invalid request"
    ),

    USER_NOT_FOUND(
            1002,
            "User not found"
    ),

    EMAIL_ALREADY_EXISTS(
            1003,
            "Email already exists"
    ),

    USERNAME_OR_PASSWORD_INVALID(
            1004,
            "Email or password is incorrect"
    ),

    ALREADY_LOGGED_IN(
            1005,
            "User is already logged in"
    ),

    SESSION_ALREADY_LOGGED_IN(
            1006,
            "This session is already logged in with another account"
    ),

    PASSWORD_NOT_MATCH(
            1007,
            "Password and confirm password do not match"
    ),

    EMAIL_REQUIRED(
            1008,
            "Email is required"
    ),

    PASSWORD_REQUIRED(
            1009,
            "Password is required"
    ),

    RESET_TOKEN_INVALID(
            1010,
            "Reset token is invalid or expired"
    ),

    RESET_TOKEN_REQUIRED(
            1011,
            "Reset token is required"
    ),

    UNAUTHENTICATED(
            1012,
            "User is not authenticated"
    ),

    FORBIDDEN(
            1013,
            "You do not have permission to access this resource"
    ),

    CANNOT_LOCK_SELF(
            1015,
            "Cannot lock the currently logged-in administrator account"
    ),

    ACCOUNT_BLOCKED(
            1016,
            "This account has been blocked. Please contact administrator."
    ),

    AI_SERVICE_UNAVAILABLE(
            1014,
            "AI service is temporarily unavailable"
    );

    private final int code;
    private final String message;

    ErrorCode(int code, String message) {
        this.code = code;
        this.message = message;
    }
}