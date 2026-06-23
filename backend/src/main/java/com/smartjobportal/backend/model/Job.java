package com.smartjobportal.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "jobs")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 200, nullable = false)
    private String title;

    @Column(length = 200, nullable = false)
    private String company;

    @Column(length = 200)
    private String location;

    @Column(length = 100)
    private String salary;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String skills;

    @Column(name = "recruiter_id")
    private Long recruiterId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruiter_id", insertable = false, updatable = false)
    @JsonIgnore
    private User recruiter;
} 
