package com.kakeipocket.KakeiPocket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kakeipocket.KakeiPocket.entity.Category;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByUser(User user);

    List<Category> findByUserAndType(User user, TransactionType type);

    Optional<Category> findByIdAndUser(Long id, User user);

    Optional<Category> findByUserAndNameAndType(
            User user,
            String name,
            TransactionType type
    );

    boolean existsByUserAndNameAndType(
            User user,
            String name,
            TransactionType type
    );
}
