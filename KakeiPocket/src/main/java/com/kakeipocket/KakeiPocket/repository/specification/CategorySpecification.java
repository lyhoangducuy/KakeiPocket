package com.kakeipocket.KakeiPocket.repository.specification;

import com.kakeipocket.KakeiPocket.entity.Category;
import com.kakeipocket.KakeiPocket.enums.TransactionType;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public final class CategorySpecification {

    private CategorySpecification() {}

    /**
     * Filter system default categories.
     *
     * @param systemUserId the system admin user id
     * @param keyword      search by name (LIKE, case-insensitive)
     * @param type         filter by transaction type
     */
    public static Specification<Category> systemCategories(
            Long systemUserId,
            String keyword,
            TransactionType type
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("user").get("id"), systemUserId));
            predicates.add(cb.isTrue(root.get("isDefault")));

            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(
                        cb.like(cb.lower(root.get("name")), pattern)
                );
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("type"), type));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
