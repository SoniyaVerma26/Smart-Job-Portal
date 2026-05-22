/*
  # Smart Job Portal Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `phone` (text)
      - `role` (text: 'job_seeker' or 'recruiter')
      - `skills` (text array)
      - `resume_url` (text)
      - `company` (text, for recruiters)
      - `avatar_url` (text)
      - `created_at` (timestamp)
    - `jobs`
      - `id` (uuid, primary key)
      - `recruiter_id` (uuid, references profiles)
      - `title` (text)
      - `company` (text)
      - `location` (text)
      - `type` (text: full-time, part-time, remote, contract)
      - `salary_min` (integer)
      - `salary_max` (integer)
      - `description` (text)
      - `requirements` (text array)
      - `skills` (text array)
      - `category` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
    - `applications`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `seeker_id` (uuid, references profiles)
      - `status` (text: applied, reviewing, interview, rejected, offered)
      - `cover_letter` (text)
      - `created_at` (timestamp)
    - `saved_jobs`
      - `id` (uuid, primary key)
      - `job_id` (uuid, references jobs)
      - `seeker_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Users can read/update own profile
    - Job seekers can view active jobs and manage own applications/saved jobs
    - Recruiters can manage own jobs and view applicants for their jobs
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  phone text DEFAULT '',
  role text NOT NULL DEFAULT 'job_seeker' CHECK (role IN ('job_seeker', 'recruiter')),
  skills text[] DEFAULT '{}',
  resume_url text DEFAULT '',
  company text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recruiter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  company text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'full-time' CHECK (type IN ('full-time', 'part-time', 'remote', 'contract', 'internship')),
  salary_min integer DEFAULT 0,
  salary_max integer DEFAULT 0,
  description text NOT NULL DEFAULT '',
  requirements text[] DEFAULT '{}',
  skills text[] DEFAULT '{}',
  category text DEFAULT '',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  TO authenticated
  USING (is_active = true OR recruiter_id = auth.uid());

CREATE POLICY "Recruiters can insert own jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can update own jobs"
  ON jobs FOR UPDATE
  TO authenticated
  USING (recruiter_id = auth.uid())
  WITH CHECK (recruiter_id = auth.uid());

CREATE POLICY "Recruiters can delete own jobs"
  ON jobs FOR DELETE
  TO authenticated
  USING (recruiter_id = auth.uid());

-- Applications table
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'applied' CHECK (status IN ('applied', 'reviewing', 'interview', 'rejected', 'offered')),
  cover_letter text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, seeker_id)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can view own applications"
  ON applications FOR SELECT
  TO authenticated
  USING (seeker_id = auth.uid() OR EXISTS (
    SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
  ));

CREATE POLICY "Seekers can insert own applications"
  ON applications FOR INSERT
  TO authenticated
  WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Recruiters can update applications for their jobs"
  ON applications FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM jobs WHERE jobs.id = applications.job_id AND jobs.recruiter_id = auth.uid()
  ));

-- Saved jobs table
CREATE TABLE IF NOT EXISTS saved_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  seeker_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(job_id, seeker_id)
);

ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Seekers can view own saved jobs"
  ON saved_jobs FOR SELECT
  TO authenticated
  USING (seeker_id = auth.uid());

CREATE POLICY "Seekers can save jobs"
  ON saved_jobs FOR INSERT
  TO authenticated
  WITH CHECK (seeker_id = auth.uid());

CREATE POLICY "Seekers can unsave jobs"
  ON saved_jobs FOR DELETE
  TO authenticated
  USING (seeker_id = auth.uid());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
CREATE INDEX IF NOT EXISTS idx_applications_seeker ON applications(seeker_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_seeker ON saved_jobs(seeker_id);
