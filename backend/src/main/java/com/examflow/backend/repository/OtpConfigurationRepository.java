package com.examflow.backend.repository;

import com.examflow.backend.entity.Instructor;
import com.examflow.backend.entity.OtpConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpConfigurationRepository extends JpaRepository<OtpConfiguration, Integer> {

    OtpConfiguration findByContactNumberAndStatus(String contactNumber, Integer status);

    OtpConfiguration findByContactNumberAndStatusAndInstructor(String contactNumber, Integer status,
            Instructor instructor);

}
