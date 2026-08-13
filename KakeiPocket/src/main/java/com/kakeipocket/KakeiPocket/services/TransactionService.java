package com.kakeipocket.KakeiPocket.services;

import com.kakeipocket.KakeiPocket.dto.Transaction.CreateExpenseRequest;
import com.kakeipocket.KakeiPocket.dto.Transaction.CreateIncomeRequest;
import com.kakeipocket.KakeiPocket.dto.Transaction.TransactionDetailResponse;
import com.kakeipocket.KakeiPocket.dto.Transaction.TransactionResponse;
import com.kakeipocket.KakeiPocket.dto.Transaction.UpdateExpenseRequest;
import com.kakeipocket.KakeiPocket.dto.Transaction.UpdateIncomeRequest;
import com.kakeipocket.KakeiPocket.entity.Category;
import com.kakeipocket.KakeiPocket.entity.MonthlyPlan;
import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletType;
import com.kakeipocket.KakeiPocket.repository.CategoryRepository;
import com.kakeipocket.KakeiPocket.repository.MonthlyPlanRepository;
import com.kakeipocket.KakeiPocket.repository.TransactionRepository;
import com.kakeipocket.KakeiPocket.repository.UserRepository;
import com.kakeipocket.KakeiPocket.repository.specification.TransactionSpecification;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Transactional
    public TransactionResponse createExpense(
            Long userId,
            CreateExpenseRequest request
    ) {
        User user = getUser(userId);

        Category category = getExpenseCategoryOwnedBy(
                user, request.getCategoryId()
        );

        MonthlyPlan monthlyPlan = findMonthlyPlanByDate(
                user, request.getTransactionDate()
        );

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .monthlyPlan(monthlyPlan)
                .type(TransactionType.EXPENSE)
                .walletType(request.getWalletType())
                .amount(request.getAmount())
                .transactionDate(request.getTransactionDate())
                .note(trimNote(request.getNote()))
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    @Transactional
    public TransactionResponse createIncome(
            Long userId,
            CreateIncomeRequest request
    ) {
        User user = getUser(userId);

        Category category = getIncomeCategoryOwnedBy(
                user, request.getCategoryId()
        );

        MonthlyPlan monthlyPlan = findMonthlyPlanByDate(
                user, request.getTransactionDate()
        );

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .monthlyPlan(monthlyPlan)
                .type(TransactionType.INCOME)
                .walletType(com.kakeipocket.KakeiPocket.enums.WalletType.SAVING)
                .amount(request.getAmount())
                .transactionDate(request.getTransactionDate())
                .note(trimNote(request.getNote()))
                .build();

        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionHistory(
            Long userId,
            TransactionType type,
            Long categoryId,
            WalletType walletType,
            LocalDate from,
            LocalDate to,
            String keyword,
            String sort
    ) {
        User user = getUser(userId);

        if (from != null && to != null && from.isAfter(to)) {
            throw new RuntimeException(
                    "Ngày bắt đầu phải trước hoặc bằng ngày kết thúc"
            );
        }

        Specification<Transaction> spec = TransactionSpecification.build(
                user, type, categoryId, walletType, from, to, keyword
        );

        Sort sortObj = resolveSort(sort);

        List<Transaction> transactions = transactionRepository.findAll(
                spec, sortObj
        );

        return transactions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TransactionDetailResponse getTransactionDetail(
            Long userId,
            Long transactionId
    ) {
        User user = getUser(userId);

        Transaction transaction = transactionRepository
                .findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Giao dịch không tồn tại hoặc không thuộc về bạn"
                ));

        return toDetailResponse(transaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactions(
            Long userId,
            TransactionType type,
            LocalDate from,
            LocalDate to
    ) {
        User user = getUser(userId);
        return findByUserAndType(user, type, from, to);
    }

    @Transactional
    public TransactionResponse updateExpense(
            Long userId,
            Long transactionId,
            UpdateExpenseRequest request
    ) {
        User user = getUser(userId);

        Transaction transaction = getOwnedTransaction(user, transactionId);

        if (transaction.getType() != TransactionType.EXPENSE) {
            throw new RuntimeException("Không thể cập nhật giao dịch thu nhập");
        }

        Category category = getExpenseCategoryOwnedBy(
                user, request.getCategoryId()
        );

        applyExpenseUpdate(transaction, category, request);
        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    @Transactional
    public TransactionResponse updateIncome(
            Long userId,
            Long transactionId,
            UpdateIncomeRequest request
    ) {
        User user = getUser(userId);

        Transaction transaction = getOwnedTransaction(user, transactionId);

        if (transaction.getType() != TransactionType.INCOME) {
            throw new RuntimeException("Không thể cập nhật giao dịch chi tiêu");
        }

        Category category = getIncomeCategoryOwnedBy(
                user, request.getCategoryId()
        );

        applyIncomeUpdate(transaction, category, request);
        Transaction saved = transactionRepository.save(transaction);
        return toResponse(saved);
    }

    @Transactional
    public void deleteTransaction(Long userId, Long transactionId) {
        User user = getUser(userId);

        Transaction transaction = transactionRepository
                .findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Giao dịch không tồn tại hoặc không thuộc về bạn"
                ));

        transactionRepository.delete(transaction);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Transaction getOwnedTransaction(User user, Long transactionId) {
        return transactionRepository.findByIdAndUser(transactionId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Giao dịch không tồn tại hoặc không thuộc về bạn"
                ));
    }

    private Category getExpenseCategoryOwnedBy(User user, Long categoryId) {
        Category category = categoryRepository
                .findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Danh mục không tồn tại hoặc không thuộc về bạn"
                ));

        if (category.getType() != TransactionType.EXPENSE) {
            throw new RuntimeException(
                    "Danh mục phải là loại Chi tiêu (EXPENSE)"
            );
        }

        return category;
    }

    private Category getIncomeCategoryOwnedBy(User user, Long categoryId) {
        Category category = categoryRepository
                .findByIdAndUser(categoryId, user)
                .orElseThrow(() -> new RuntimeException(
                        "Danh mục không tồn tại hoặc không thuộc về bạn"
                ));

        if (category.getType() != TransactionType.INCOME) {
            throw new RuntimeException(
                    "Danh mục phải là loại Thu nhập (INCOME)"
            );
        }

        return category;
    }

    private MonthlyPlan findMonthlyPlanByDate(User user, LocalDate date) {
        return monthlyPlanRepository
                .findByUserAndMonthAndYear(
                        user,
                        date.getMonthValue(),
                        date.getYear()
                )
                .orElse(null);
    }

    private List<TransactionResponse> findByUserAndType(
            User user,
            TransactionType type,
            LocalDate from,
            LocalDate to
    ) {
        List<Transaction> transactions;
        if (from != null && to != null) {
            transactions = transactionRepository
                    .findByUserAndTypeAndDateRange(user, type, from, to);
        } else {
            transactions = transactionRepository
                    .findAllByUserAndTypeOrderByTransactionDateDesc(
                            user, type
                    );
        }

        return transactions.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private void applyExpenseUpdate(
            Transaction transaction,
            Category category,
            UpdateExpenseRequest request
    ) {
        MonthlyPlan monthlyPlan = findMonthlyPlanByDate(
                transaction.getUser(), request.getTransactionDate()
        );

        transaction.setCategory(category);
        transaction.setMonthlyPlan(monthlyPlan);
        transaction.setWalletType(request.getWalletType());
        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setNote(trimNote(request.getNote()));
    }

    private void applyIncomeUpdate(
            Transaction transaction,
            Category category,
            UpdateIncomeRequest request
    ) {
        MonthlyPlan monthlyPlan = findMonthlyPlanByDate(
                transaction.getUser(), request.getTransactionDate()
        );

        transaction.setCategory(category);
        transaction.setMonthlyPlan(monthlyPlan);
        transaction.setWalletType(null);
        transaction.setAmount(request.getAmount());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setNote(trimNote(request.getNote()));
    }

    private String trimNote(String note) {
        if (note == null) return null;
        String trimmed = note.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private Sort resolveSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(
                    Sort.Direction.DESC, "transactionDate"
            );
        }

        switch (sort.toUpperCase()) {
            case "DATE_ASC":
                return Sort.by(
                        Sort.Direction.ASC, "transactionDate"
                );
            case "DATE_DESC":
                return Sort.by(
                        Sort.Direction.DESC, "transactionDate"
                );
            case "AMOUNT_ASC":
                return Sort.by(Sort.Direction.ASC, "amount");
            case "AMOUNT_DESC":
                return Sort.by(Sort.Direction.DESC, "amount");
            default:
                return Sort.by(
                        Sort.Direction.DESC, "transactionDate"
                );
        }
    }

    private TransactionDetailResponse toDetailResponse(
            Transaction transaction
    ) {
        return TransactionDetailResponse.builder()
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
                .transactionDate(
                        transaction.getTransactionDate() != null
                                ? transaction.getTransactionDate()
                                        .toString()
                                : null
                )
                .note(transaction.getNote())
                .createdAt(transaction.getCreatedAt() != null
                        ? transaction.getCreatedAt()
                                .format(DATE_FORMATTER)
                        : null)
                .updatedAt(transaction.getUpdatedAt() != null
                        ? transaction.getUpdatedAt()
                                .format(DATE_FORMATTER)
                        : null)
                .build();
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