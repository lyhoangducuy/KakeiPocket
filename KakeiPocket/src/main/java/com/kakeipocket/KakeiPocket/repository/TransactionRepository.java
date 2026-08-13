package com.kakeipocket.KakeiPocket.repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletType;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long>,
                JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUser(Long id, User user);

    List<Transaction> findAllByUserOrderByTransactionDateDesc(User user);

    List<Transaction> findAllByUserAndTypeOrderByTransactionDateDesc(
            User user,
            TransactionType type
    );

    @Query(
            "SELECT t FROM Transaction t WHERE t.user = :user "
                    + "AND t.type = :type "
                    + "AND t.transactionDate BETWEEN :from AND :to "
                    + "ORDER BY t.transactionDate DESC"
    )
    List<Transaction> findByUserAndTypeAndDateRange(
            @Param("user") User user,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query(
            "SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t "
                    + "WHERE t.user = :user "
                    + "AND t.type = :type "
                    + "AND t.transactionDate BETWEEN :from AND :to"
    )
    BigDecimal sumByUserAndTypeAndDateRange(
            @Param("user") User user,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query(
            "SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t "
                    + "WHERE t.user = :user "
                    + "AND t.type = :type "
                    + "AND t.walletType = :walletType "
                    + "AND t.transactionDate BETWEEN :from AND :to"
    )
    BigDecimal sumByUserAndTypeAndWalletAndDateRange(
            @Param("user") User user,
            @Param("type") TransactionType type,
            @Param("walletType") WalletType walletType,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    @Query(
            "SELECT t FROM Transaction t WHERE t.user = :user "
                    + "AND t.transactionDate BETWEEN :from AND :to "
                    + "ORDER BY t.transactionDate DESC, t.createdAt DESC"
    )
    List<Transaction> findRecentByUserAndDateRange(
            @Param("user") User user,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable
    );

    @Query(
            "SELECT t.category.id AS categoryId, "
                    + "t.category.name AS categoryName, "
                    + "SUM(t.amount) AS totalAmount "
                    + "FROM Transaction t "
                    + "WHERE t.user = :user "
                    + "AND t.type = :type "
                    + "AND t.transactionDate BETWEEN :from AND :to "
                    + "GROUP BY t.category.id, t.category.name "
                    + "ORDER BY SUM(t.amount) DESC"
    )
    List<CategoryAggregate> aggregateExpenseByCategory(
            @Param("user") User user,
            @Param("type") TransactionType type,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            Pageable pageable
    );

    interface CategoryAggregate {
        Long getCategoryId();

        String getCategoryName();

        BigDecimal getTotalAmount();
    }
}