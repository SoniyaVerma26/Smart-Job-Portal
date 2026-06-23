package com.smartjobportal.backend.repository;

import com.smartjobportal.backend.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findAllByOrderByIdDesc();

    List<Job> findByTitleContainingIgnoreCaseOrCompanyContainingIgnoreCaseOrSkillsContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByIdDesc(
            String title,
            String company,
            String skills,
            String location
    );

    int countByRecruiterId(Long recruiterId);

    List<Job> findTop5ByRecruiterIdOrderByIdDesc(Long recruiterId);
}

