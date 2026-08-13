package com.kakeipocket.KakeiPocket.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

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
}
