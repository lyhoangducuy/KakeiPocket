package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.dto.Transaction.CreateExpenseRequest;
import com.kakeipocket.KakeiPocket.dto.Transaction.TransactionResponse;
import com.kakeipocket.KakeiPocket.dto.Transaction.UpdateExpenseRequest;
import com.kakeipocket.KakeiPocket.entity.Category;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.repository.CategoryRepository;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final MonthlyPlanRepository monthlyPlanRepository;
    private final UserRepository userRepository;

    @Transactional
    public TransactionResponse createExpense(
            Long userId,
            CreateExpenseRequest request
    ) {
        User user = getUser(userId);

        Category category = categoryRepository
                .findByIdAndUser(request.getCategoryId(), user)
                .orElseThrow(() -> new RuntimeException(
                        "Danh mục không tồn tại hoặc không thuộc về bạn"
                ));

        if (category.getType() != TransactionType.EXPENSE) {
            throw new RuntimeException(
                    "Danh mục phải là loại Chi tiêu (EXPENSE)"
            );
        }

        MonthlyPlan monthlyPlan = monthlyPlanRepository
                .findByUserAndMonthAndYear(
                        user,
                        request.getTransactionDate().getMonthValue(),
                        request.getTransactionDate().getYear()
                )
                .orElse(null);

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .monthlyPlan(monthlyPlan)
                .type(TransactionType.EXPENSE)
                .walletType(request.getWalletType())
                .amount(request.getAmount())
                .transactionDate(request.getTransactionDate())
                .note(request.getNote() != null
                        ? request.getNote().trim()
                        : null)
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getExpenses(
            Long userId,
            LocalDate from,
            LocalDate to
    ) {
        User user = getUser(userId);

        List<Transaction> transactions;
        if (from != null && to != null) {
            transactions = transactionRepository
                    .findByUserAndTypeAndDateRange(
                            user,
                            TransactionType.EXPENSE,
                            from,
                            to
                    );
        } else {
            transactions = transactionRepository
                    .findAllByUserAndTypeOrderByTransactionDateDesc(
                            user,
                            TransactionType.EXPENSE
                    );
        }

        return transactions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionResponse getExpenseById(
            Long userId,
            Long transactionId
    ) {
        User user = getUser(userId);

        Transaction transaction = transactionRepository
                .findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Giao dịch không tồn tại hoặc không thuộc về bạn"
                ));

        if (transaction.getType() != TransactionType.EXPENSE) {
            throw new RuntimeException("Giao dịch không phải là chi tiêu");
        }

        return toResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateExpense(
            Long userId,
            Long transactionId,
            UpdateExpenseRequest request
    ) {
        User user = getUser(userId);

        Transaction transaction = transactionRepository
                .findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Giao dịch không tồn tại hoặc không thuộc về bạn"
                ));

        if (transaction.getType() != TransactionType.EXPENSE) {
            throw new RuntimeException("Không thể cập nhật giao dịch thu nhập");
        }

        Category category = categoryRepository
                .findByIdAndUser(request.getCategoryId(), user)
                .orElseThrow(() -> new RuntimeException(
                        "Danh mục không tồn tại hoặc không thuộc về bạn"
                ));

        if (category.getType() != TransactionType.EXPENSE) {
            throw new RuntimeException(
                    "Danh mục phải là loại Chi tiêu (EXPENSE)"
            );
        }

        MonthlyPlan monthlyPlan = monthlyPlanRepository
                .findByUserAndMonthAndYear(
                        user,
                        request.getTransactionDate().getMonthValue(),
                        request.getTransactionDate().getYear()
                )
                .orElse(null);

        transaction.setCategory(category);
        transaction.setMonthlyPlan(monthlyPlan);
        transaction.setWalletType(request.getWalletType());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setNote(request.getNote() != null
                ? request.getNote().trim()
                : null);

        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    @Transactional
    public void deleteExpense(Long userId, Long transactionId) {
        User user = getUser(userId);

        Transaction transaction = transactionRepository
                .findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Giao dịch không tồn tại hoặc không thuộc về bạn"
                ));

        if (transaction.getType() != TransactionType.EXPENSE) {
            throw new RuntimeException("Không thể xóa giao dịch thu nhập");
        }

        transactionRepository.delete(transaction);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .categoryId(transaction.getCategory() != null
                        ? transaction.getCategory().getId()
                        : null)
                .categoryName(transaction.getCategory() != null
                        ? transaction.getCategory().getName()
                        : null)
                .walletType(transaction.getWalletType())
                .amount(transaction.getAmount())
                .transactionDate(transaction.getTransactionDate())
                .note(transaction.getNote())
                .createdAt(transaction.getCreatedAt())
                .updatedAt(transaction.getUpdatedAt())
                .build();
    }
}
