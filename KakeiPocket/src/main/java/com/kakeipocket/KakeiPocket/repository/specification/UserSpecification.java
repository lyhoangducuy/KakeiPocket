package com.kakeipocket.KakeiPocket.repository.specification;

import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.UserStatus;

import jakarta.persistence.criteria.Predicate;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public final class UserSpecification {

    private UserSpecification() {}

    public static Specification<User> filterUsers(
            String keyword,
            String roleName,
            UserStatus status
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate fullNameMatch = cb.like(
                        cb.lower(root.get("fullName")),
                        pattern
                );
                Predicate emailMatch = cb.like(
                        cb.lower(root.get("email")),
                        pattern
                );
                predicates.add(cb.or(fullNameMatch, emailMatch));
            }

            if (StringUtils.hasText(roleName)) {
                predicates.add(
                        cb.equal(
                                cb.lower(root.get("role").get("name")),
                                roleName.trim().toLowerCase()
                        )
                );
            }

            if (status != null) {
                predicates.add(
                        cb.equal(root.get("status"), status)
                );
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
