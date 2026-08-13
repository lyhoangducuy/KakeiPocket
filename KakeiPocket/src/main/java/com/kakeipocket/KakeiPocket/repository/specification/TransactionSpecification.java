package com.kakeipocket.KakeiPocket.repository.specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.kakeipocket.KakeiPocket.entity.Transaction;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;
import com.kakeipocket.KakeiPocket.enums.WalletType;

import jakarta.persistence.criteria.Predicate;

public final class TransactionSpecification {

    private TransactionSpecification() {}

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

            predicates.add(cb.equal(root.get("user"), user));

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
                                root.get("transactionDate"), from
                        )
                );
            }

            if (to != null) {
                predicates.add(
                        cb.lessThanOrEqualTo(
                                root.get("transactionDate"), to
                        )
                );
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate categoryMatch = cb.like(
                        cb.lower(root.get("category").get("name")),
                        pattern
                );
                Predicate noteMatch = cb.like(
                        cb.lower(root.get("note")), pattern
                );
                predicates.add(cb.or(categoryMatch, noteMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}