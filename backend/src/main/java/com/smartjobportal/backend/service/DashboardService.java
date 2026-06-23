package com.smartjobportal.backend.service;

import com.smartjobportal.backend.repository.ApplicationRepository;
import com.smartjobportal.backend.repository.JobRepository;
import com.smartjobportal.backend.model.Application;
import com.smartjobportal.backend.model.Job;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    public Map<String, Object> getRecruiterDashboard(Long recruiterId) {
        Map<String, Object> response = new HashMap<>();
        int totalJobs = jobRepository.countByRecruiterId(recruiterId);
        int totalApplications = applicationRepository.countApplicationsForRecruiter(recruiterId);
        List<Job> recentJobs = jobRepository.findTop5ByRecruiterIdOrderByIdDesc(recruiterId);

        response.put("success", true);
        response.put("totalJobs", totalJobs);
        response.put("totalApplications", totalApplications);
        response.put("recentJobs", recentJobs);
        return response;
    }

    public Map<String, Object> getUserDashboard(Long userId) {
        Map<String, Object> response = new HashMap<>();
        int totalAppliedJobs = applicationRepository.countByUserId(userId);
        Map<String, Integer> applicationStatuses = new HashMap<>();
        List<Object[]> statusCounts = applicationRepository.countStatusByUserId(userId);
        for (Object[] row : statusCounts) {
            if (row.length == 2 && row[0] instanceof String && row[1] instanceof Long) {
                applicationStatuses.put((String) row[0], ((Long) row[1]).intValue());
            } else if (row.length == 2 && row[0] instanceof String && row[1] instanceof Integer) {
                applicationStatuses.put((String) row[0], (Integer) row[1]);
            }
        }
        List<Application> recentApplications = applicationRepository.findTop5ByUserIdOrderByIdDesc(userId);

        response.put("success", true);
        response.put("totalAppliedJobs", totalAppliedJobs);
        response.put("applicationStatuses", applicationStatuses);
        response.put("recentApplications", recentApplications);
        return response;
    }
}
