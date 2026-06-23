package com.smartjobportal.backend.service;

import com.smartjobportal.backend.model.Job;
import com.smartjobportal.backend.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class JobService {

    @Autowired
    private JobRepository jobRepository;

    public Job createJob(Job job) {
        return jobRepository.save(job);
    }

    public List<Job> getAllJobs() {
        return jobRepository.findAllByOrderByIdDesc();
    }

    public List<Job> searchJobs(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return List.of();
        }
        String value = keyword.trim();
        return jobRepository.findByTitleContainingIgnoreCaseOrCompanyContainingIgnoreCaseOrSkillsContainingIgnoreCaseOrLocationContainingIgnoreCaseOrderByIdDesc(
                value, value, value, value
        );
    }

    public boolean updateJob(Long id, Job job) {
        if (!jobRepository.existsById(id)) {
            return false;
        }
        job.setId(id);
        jobRepository.save(job);
        return true;
    }

    public boolean deleteJob(Long id) {
        if (!jobRepository.existsById(id)) {
            return false;
        }
        jobRepository.deleteById(id);
        return true;
    }
}

