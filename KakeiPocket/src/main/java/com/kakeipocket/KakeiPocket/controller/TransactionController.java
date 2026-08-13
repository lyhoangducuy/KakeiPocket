package com.kakeipocket.KakeiPocket.controller;

import com.kakeipocket.KakeiPocket.config.ApiResponse;
import com.kakeipocket.KakeiPocket.dto.Transaction.CreateExpenseRequest;
import com.kakeipocket.KakeiPocket.dto.Transaction.CreateIncomeRequest;
import com.kakeipocket.KakeiPocket.dto.Transaction.TransactionDetailResponse;
import com.kakeipocket.KakeiPocket.dto.Transaction.TransactionResponse;
import com.kakeipocket.KakeiPocket.dto.Transaction.UpdateExpenseRequest;
import com.kakeipocket.KakeiPocket.dto.Transaction.UpdateIncomeRequest;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletType;
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

    @GetMapping
    public ApiResponse<List<TransactionResponse>> getTransactionHistory(
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) WalletType walletType,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort,
            HttpSession session
    ) {
        return ApiResponse
                .<List<TransactionResponse>>builder()
                .code(1000)
                .message("Get transactions successfully")
                .result(
                        transactionService.getTransactionHistory(
                                (Long) session.getAttribute("userId"),
                                type,
                                categoryId,
                                walletType,
                                from,
                                to,
                                keyword,
                                sort
                        )
                )
                .build();
    }

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

    @PostMapping("/income")
    public ApiResponse<TransactionResponse> createIncome(
            @RequestBody @Valid CreateIncomeRequest request,
            HttpSession session
    ) {
        return ApiResponse
                .<TransactionResponse>builder()
                .code(1000)
                .message("Create income successfully")
                .result(
                        transactionService.createIncome(
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
                        transactionService.getTransactions(
                                (Long) session.getAttribute("userId"),
                                TransactionType.EXPENSE,
                                from,
                                to
                        )
                )
                .build();
    }

    @GetMapping("/incomes")
    public ApiResponse<List<TransactionResponse>> getIncomes(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            HttpSession session
    ) {
        return ApiResponse
                .<List<TransactionResponse>>builder()
                .code(1000)
                .message("Get incomes successfully")
                .result(
                        transactionService.getTransactions(
                                (Long) session.getAttribute("userId"),
                                TransactionType.INCOME,
                                from,
                                to
                        )
                )
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<TransactionDetailResponse> getTransactionDetail(
            @PathVariable Long id,
            HttpSession session
    ) {
        return ApiResponse
                .<TransactionDetailResponse>builder()
                .code(1000)
                .message("Get transaction successfully")
                .result(
                        transactionService.getTransactionDetail(
                                (Long) session.getAttribute("userId"),
                                id
                        )
                )
                .build();
    }

    @PutMapping("/{id}/expense")
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

    @PutMapping("/{id}/income")
    public ApiResponse<TransactionResponse> updateIncome(
            @PathVariable Long id,
            @RequestBody @Valid UpdateIncomeRequest request,
            HttpSession session
    ) {
        return ApiResponse
                .<TransactionResponse>builder()
                .code(1000)
                .message("Update income successfully")
                .result(
                        transactionService.updateIncome(
                                (Long) session.getAttribute("userId"),
                                id,
                                request
                        )
                )
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteTransaction(
            @PathVariable Long id,
            HttpSession session
    ) {
        transactionService.deleteTransaction(
                (Long) session.getAttribute("userId"),
                id
        );

        return ApiResponse
                .<Void>builder()
                .code(1000)
                .message("Delete transaction successfully")
                .result(null)
                .build();
    }
}