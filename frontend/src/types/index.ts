export type UserRole = 'job_seeker' | 'recruiter';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: UserRole;
  skills: string[];
  resume_url: string;
  company: string;
  avatar_url: string;
  created_at: string;
}

export type JobType = 'full-time' | 'part-time' | 'remote' | 'contract' | 'internship';

export interface Job {
  id: string | number;
  recruiter_id?: string;
  title: string;
  company: string;
  location: string;
  type?: JobType | string;
  salary?: string;
  salary_min?: number;
  salary_max?: number;
  description: string;
  requirements?: string[];
  skills?: string | string[];
  category?: string;
  is_active?: boolean;
  created_at?: string;
}

export type ApplicationStatus = 'applied' | 'reviewing' | 'interview' | 'rejected' | 'offered';

export interface Application {
  id: string;
  job_id: string;
  seeker_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  created_at: string;
  job?: Job;
}

export interface SavedJob {
  id: string;
  job_id: string;
  seeker_id: string;
  created_at: string;
  job?: Job;
}
