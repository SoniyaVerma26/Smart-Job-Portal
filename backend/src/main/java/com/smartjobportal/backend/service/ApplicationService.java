package com.smartjobportal.backend.service;

import com.smartjobportal.backend.model.Application;
import com.smartjobportal.backend.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    public boolean hasApplied(Long jobId, Long userId) {
        return applicationRepository.existsByJobIdAndUserId(jobId, userId);
    }

    public Application createApplication(Application application) {
        if (application.getStatus() == null) {
            application.setStatus("PENDING");
        }
        return applicationRepository.save(application);
    }

    public List<Application> getApplicationsByUserId(Long userId) {
        return applicationRepository.findByUserId(userId);
    }
} 
