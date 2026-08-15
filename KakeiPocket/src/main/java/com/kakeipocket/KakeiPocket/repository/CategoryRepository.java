package com.kakeipocket.KakeiPocket.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.kakeipocket.KakeiPocket.entity.Category;
import com.kakeipocket.KakeiPocket.entity.User;
import com.kakeipocket.KakeiPocket.enums.TransactionType;

public interface CategoryRepository
        extends JpaRepository<Category, Long>,
                JpaSpecificationExecutor<Category> {

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

    /**
     * Find system default categories owned by the system admin user.
     */
    @Query(
            "SELECT c FROM Category c "
                    + "WHERE c.user.id = :systemUserId "
                    + "AND c.isDefault = true"
    )
    List<Category> findSystemCategories(
            @Param("systemUserId") Long systemUserId
    );

    boolean existsByIdAndUser(Long id, User user);
}
