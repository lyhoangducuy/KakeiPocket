package com.kakeipocket.KakeiPocket.config;

import com.kakeipocket.KakeiPocket.enums.ErrorCode;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ErrorCode errorCode = ex.getErrorCode();
        HttpStatus status = mapStatus(errorCode);
        return ResponseEntity.status(status)
                .body(ApiResponse.error(errorCode));
    }

    private HttpStatus mapStatus(ErrorCode errorCode) {
        if (errorCode == null) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        }
        int code = errorCode.getCode();
        if (code == 1012) {
            return HttpStatus.UNAUTHORIZED;
        }
        if (code == 1013) {
            return HttpStatus.FORBIDDEN;
        }
        if (code == 1015) {
            return HttpStatus.BAD_REQUEST;
        }
        if (code >= 1017 && code <= 1020) {
            return HttpStatus.BAD_REQUEST;
        }
        if (code >= 1001 && code < 1010) {
            return HttpStatus.BAD_REQUEST;
        }
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
}
