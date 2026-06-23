package com.smartjobportal.backend.repository;

import com.smartjobportal.backend.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    boolean existsByJobIdAndUserId(Long jobId, Long userId);

    List<Application> findByUserId(Long userId);

    int countByUserId(Long userId);

    List<Application> findTop5ByUserIdOrderByIdDesc(Long userId);

    @Query("SELECT COUNT(a) FROM Application a JOIN a.job j WHERE j.recruiterId = :recruiterId")
    int countApplicationsForRecruiter(@Param("recruiterId") Long recruiterId);

    @Query("SELECT a.status, COUNT(a) FROM Application a WHERE a.userId = :userId GROUP BY a.status")
    List<Object[]> countStatusByUserId(@Param("userId") Long userId);
}

