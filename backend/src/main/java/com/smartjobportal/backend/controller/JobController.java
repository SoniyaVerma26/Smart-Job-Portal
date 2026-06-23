package com.smartjobportal.backend.controller;

import com.smartjobportal.backend.model.Job;
import com.smartjobportal.backend.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
public class JobController {

    @Autowired
    private JobService jobService;

    @PostMapping("/jobs")
    public ResponseEntity<Map<String, Object>> createJob(@RequestBody Job job) {
        Map<String, Object> resp = new HashMap<>();
        if (job.getTitle() == null || job.getTitle().isBlank() || job.getCompany() == null || job.getCompany().isBlank()) {
            resp.put("success", false);
            resp.put("message", "Title and company are required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
        try {
            Job created = jobService.createJob(job);
            if (created == null) {
                resp.put("success", false);
                resp.put("message", "Failed to save job");
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
            }
            resp.put("success", true);
            resp.put("message", "Job created successfully");
            resp.put("job", created);
            return ResponseEntity.status(HttpStatus.CREATED).body(resp);
        } catch (Exception e) {
            e.printStackTrace();
            resp.put("success", false);
            resp.put("message", "An error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @GetMapping("/jobs")
    public ResponseEntity<Map<String, Object>> listJobs() {
        Map<String, Object> resp = new HashMap<>();
        try {
            List<Job> jobs = jobService.getAllJobs();
            resp.put("success", true);
            resp.put("jobs", jobs);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            resp.put("success", false);
            resp.put("message", "An error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @GetMapping("/jobs/search")
    public ResponseEntity<Map<String, Object>> searchJobs(String keyword) {
        Map<String, Object> resp = new HashMap<>();
        try {
            if (keyword == null || keyword.isBlank()) {
                resp.put("success", true);
                resp.put("jobs", List.of());
                return ResponseEntity.ok(resp);
            }
            List<Job> jobs = jobService.searchJobs(keyword);
            resp.put("success", true);
            resp.put("jobs", jobs);
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            resp.put("success", false);
            resp.put("message", "An error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @PutMapping("/jobs/{id}")
    public ResponseEntity<Map<String, Object>> updateJob(@PathVariable Long id, @RequestBody Job job) {
        Map<String, Object> resp = new HashMap<>();
        if (job.getTitle() == null || job.getTitle().isBlank() ||
                job.getCompany() == null || job.getCompany().isBlank() ||
                job.getLocation() == null || job.getLocation().isBlank() ||
                job.getSalary() == null || job.getSalary().isBlank() ||
                job.getDescription() == null || job.getDescription().isBlank() ||
                job.getSkills() == null || job.getSkills().isBlank()) {
            resp.put("success", false);
            resp.put("message", "All job fields are required for update");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
        try {
            boolean updated = jobService.updateJob(id, job);
            if (!updated) {
                resp.put("success", false);
                resp.put("message", "Job not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
            }
            resp.put("success", true);
            resp.put("message", "Job updated successfully");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            resp.put("success", false);
            resp.put("message", "An error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<Map<String, Object>> deleteJob(@PathVariable Long id) {
        Map<String, Object> resp = new HashMap<>();
        if (id == null || id <= 0) {
            resp.put("success", false);
            resp.put("message", "Invalid job id");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(resp);
        }
        try {
            boolean deleted = jobService.deleteJob(id);
            if (!deleted) {
                resp.put("success", false);
                resp.put("message", "Job not found");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(resp);
            }
            resp.put("success", true);
            resp.put("message", "Job deleted successfully");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            e.printStackTrace();
            resp.put("success", false);
            resp.put("message", "An error occurred");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(resp);
        }
    }
}
