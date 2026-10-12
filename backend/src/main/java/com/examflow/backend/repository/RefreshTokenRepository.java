package com.examflow.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.RefreshToken;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Integer> {

    RefreshToken findByTokenHash(String tokenHash);

    List<RefreshToken> findByFamilyIdAndStatusNot(String familyId, Integer status);

    List<RefreshToken> findByUserSeqAndUserRoleAndStatusNot(Integer userSeq, String userRole, Integer status);

    List<RefreshToken> findByStatusNotAndExpiresDateTimeBefore(Integer status, LocalDateTime dateTime);

    boolean existsByFamilyIdAndStatusAndExpiresDateTimeAfter(String familyId, Integer status, LocalDateTime dateTime);

    boolean existsByFamilyIdAndRevokeReason(String familyId, String revokeReason);
}
