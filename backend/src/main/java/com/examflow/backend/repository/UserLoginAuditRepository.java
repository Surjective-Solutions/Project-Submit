package com.examflow.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.examflow.backend.entity.UserLoginAudit;

public interface UserLoginAuditRepository extends JpaRepository<UserLoginAudit, Integer> {

    UserLoginAudit findFirstByUserSeqAndUserRoleAndJwtTokenHashOrderByUserLoginAuditSeqDesc(Integer userSeq,
            String userRole, String jwtTokenHash);
}
