package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Transaction.CreateExpenseRequest;
import com.kakeipocket.KakeiPocket.dto.Transaction.TransactionResponse;
import com.kakeipocket.KakeiPocket.dto.Transaction.UpdateExpenseRequest;
import com.kakeipocket.KakeiPocket.services.TransactionService;

import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(
        level = lombok.AccessLevel.PRIVATE,
        makeFinal = true
)
@RequestMapping("/api/transactions")
public class TransactionController {

    TransactionService transactionService;

    @PostMapping("/expense")
    public ApiResponse<TransactionResponse> createExpense(
            @RequestBody @Valid CreateExpenseRequest request,
            HttpSession session
    ) {
        return ApiResponse
                .<TransactionResponse>builder()
                .code(1000)
                .message("Create expense successfully")
                .result(
                        transactionService.createExpense(
                                (Long) session.getAttribute("userId"),
                                request
                        )
                )
                .build();
    }

    @GetMapping("/expenses")
    public ApiResponse<List<TransactionResponse>> getExpenses(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpSession session
    ) {
        return ApiResponse
                .<List<TransactionResponse>>builder()
                .code(1000)
                .message("Get expenses successfully")
                .result(
                        transactionService.getExpenses(
                                (Long) session.getAttribute("userId"),
                                from,
                                to
                        )
                )
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<TransactionResponse> getExpenseById(
            @PathVariable Long id,
            HttpSession session
    ) {
        return ApiResponse
                .<TransactionResponse>builder()
                .code(1000)
                .message("Get expense successfully")
                .result(
                        transactionService.getExpenseById(
                                (Long) session.getAttribute("userId"),
                                id
                        )
                )
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<TransactionResponse> updateExpense(
            @PathVariable Long id,
            @RequestBody @Valid UpdateExpenseRequest request,
            HttpSession session
    ) {
        return ApiResponse
                .<TransactionResponse>builder()
                .code(1000)
                .message("Update expense successfully")
                .result(
                        transactionService.updateExpense(
                                (Long) session.getAttribute("userId"),
                                id,
                                request
                        )
                )
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteExpense(
            @PathVariable Long id,
            HttpSession session
    ) {
        transactionService.deleteExpense(
                (Long) session.getAttribute("userId"),
                id
        );

        return ApiResponse
                .<Void>builder()
                .code(1000)
                .message("Delete expense successfully")
                .result(null)
                .build();
    }
}
