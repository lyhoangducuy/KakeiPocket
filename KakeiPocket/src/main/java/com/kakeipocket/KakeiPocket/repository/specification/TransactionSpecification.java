package com.kakeipocket.KakeiPocket.repository.specification;

import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletType;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public final class TransactionSpecification {

    private TransactionSpecification() {}

    /**
     * Filter used by user transaction listing.
     */
    public static Specification<Transaction> build(
            User user,
            TransactionType type,
            Long categoryId,
            WalletType walletType,
            LocalDate from,
            LocalDate to,
            String keyword
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (user != null) {
                predicates.add(cb.equal(root.get("user"), user));
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }
            if (categoryId != null) {
                predicates.add(
                        cb.equal(root.get("category").get("id"), categoryId)
                );
            }
            if (walletType != null) {
                predicates.add(
                        cb.equal(root.get("walletType"), walletType)
                );
            }
            if (from != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("transactionDate"),
                                from)
                );
            }
            if (to != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("transactionDate"),
                                to)
                );
            }
            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(
                        cb.like(cb.lower(root.get("note")), pattern)
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Filter transactions for admin export.
     *
     * @param fromDate     inclusive lower bound for transactionDate (nullable)
     * @param toDate       inclusive upper bound for transactionDate (nullable)
     * @param userId       restrict to a single user (nullable)
     * @param categoryId   restrict to a single category (nullable)
     * @param type         restrict to a transaction type (nullable)
     */
    public static Specification<Transaction> exportFilter(
            LocalDate fromDate,
            LocalDate toDate,
            Long userId,
            Long categoryId,
            TransactionType type
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (fromDate != null) {
                predicates.add(
                        cb.greaterThanOrEqualTo(
                                root.get("transactionDate"),
                                fromDate)
                );
            }
            if (toDate != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("transactionDate"),
                                toDate)
                );
            }
            if (userId != null) {
                predicates.add(
                        cb.equal(root.get("user").get("id"), userId)
                );
            }
            if (categoryId != null) {
                predicates.add(
                        cb.equal(root.get("category").get("id"), categoryId)
                );
            }
            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}