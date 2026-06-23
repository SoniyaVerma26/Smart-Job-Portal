import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { categories, locations, allSkills } from '../data/mock';
import JobCard from '../components/ui/JobCard';
import Pagination from '../components/ui/Pagination';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { applicationApi } from '../lib/api';
import type { Job, JobType } from '../types';

const JOBS_PER_PAGE = 6;

export default function JobListingsPage() {

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedType, setSelectedType] = useState<JobType | ''>('');
  const [selectedSkill, setSelectedSkill] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Backend jobs state
  const [jobs, setJobs] = useState<Job[]>([]);
  const [appliedJobs, setAppliedJobs] = useState<Set<string>>(new Set());
  const [applyingJobs, setApplyingJobs] = useState<Set<string>>(new Set());

  const resumeUrl = (profile?.resume_url?.trim() || '').trim();
  const hasResume = Boolean(resumeUrl);

  // Fetch jobs from backend
  useEffect(() => {

    fetch("http://localhost:8080/jobs")
      .then((res) => res.json())
      .then((data) => {

        console.log("Backend Response:", data);

        // backend response => { success: true, jobs: [...] }
        setJobs(data.jobs || []);

      })
      .catch((err) => {
        console.log("Error fetching jobs:", err);
      });

  }, []);

  // Load applied jobs for current user
  useEffect(() => {
    if (user?.id) {
      applicationApi.getUserApplications(user.id)
        .then(data => {
          if (data.applications) {
            const appliedJobIds = new Set<string>(
              data.applications.map((app: { job_id: string | number }) => String(app.job_id))
            );
            setAppliedJobs(appliedJobIds);
          }
        })
        .catch(err => {
          console.log("Error fetching applications:", err);
        });
    }
  }, [user?.id]);

  // Filter jobs
  const filteredJobs = useMemo(() => {

    return jobs.filter((job) => {

      const skillsText = Array.isArray(job.skills)
        ? job.skills.join(' ').toLowerCase()
        : String(job.skills || '').toLowerCase();
      const searchText = search.toLowerCase();
      const selectedSkillText = selectedSkill.toLowerCase();

      const matchesSearch =
        !search ||
        job.title?.toLowerCase().includes(searchText) ||
        job.company?.toLowerCase().includes(searchText) ||
        skillsText.includes(searchText);

      const matchesCategory =
        !selectedCategory || job.category === selectedCategory;

      const matchesLocation =
        !selectedLocation || job.location === selectedLocation;

      const matchesType =
        !selectedType || job.type === selectedType;

      const matchesSkill =
        !selectedSkill || skillsText.includes(selectedSkillText);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesType &&
        matchesSkill
      );

    });

  }, [
    jobs,
    search,
    selectedCategory,
    selectedLocation,
    selectedType,
    selectedSkill
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredJobs.length / JOBS_PER_PAGE);

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * JOBS_PER_PAGE,
    currentPage * JOBS_PER_PAGE
  );

  // Check filters
  const hasFilters =
    selectedCategory ||
    selectedLocation ||
    selectedType ||
    selectedSkill;

  // Handle apply to job
  const handleApplyToJob = async (jobId: string) => {
    if (!user?.id) {
      alert('Please login to apply for jobs');
      return;
    }

    if (!hasResume) {
      alert('Please upload your resume in your profile before applying for jobs.');
      navigate('/profile');
      return;
    }

    if (appliedJobs.has(jobId)) {
      alert('You have already applied for this job');
      return;
    }

    setApplyingJobs(prev => new Set([...prev, jobId]));

    try {
      const response = await applicationApi.applyToJob(jobId, user.id, resumeUrl);
      if (response.success) {
        setAppliedJobs(prev => new Set([...prev, jobId]));
        alert('Successfully applied for the job!');
      } else {
        alert(response.message || 'Failed to apply for job');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply for job';
      alert(errorMessage);
    } finally {
      setApplyingJobs(prev => {
        const newSet = new Set(prev);
        newSet.delete(jobId);
        return newSet;
      });
    }
  };

  // Clear filters
  const clearFilters = () => {

    setSelectedCategory('');
    setSelectedLocation('');
    setSelectedType('');
    setSelectedSkill('');
    setSearch('');
    setSearchParams({});

  };

  // Search submit
  const handleSearch = (e: React.FormEvent) => {

    e.preventDefault();

    setCurrentPage(1);

    if (search) {
      setSearchParams({ q: search });
    } else {
      setSearchParams({});
    }

  };

  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search Bar */}
        <div className="mb-6">

          <form onSubmit={handleSearch} className="flex gap-2">

            <div className="relative flex-1">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search jobs by title, company, or skill..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
              />

            </div>

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-medium transition-colors ${
                showFilters
                  ? 'border-blue-600 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >

              <SlidersHorizontal className="w-5 h-5" />

              <span className="hidden sm:inline">
                Filters
              </span>

            </button>

            {/* Search Button */}
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>

          </form>

        </div>

        {/* Filters */}
        {showFilters && (

          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">

            <div className="flex items-center justify-between mb-4">

              <h3 className="font-semibold text-gray-900">
                Filters
              </h3>

              {hasFilters && (

                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >

                  <X className="w-4 h-4" />

                  Clear all

                </button>

              )}

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Category */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>

                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >

                  <option value="">All Categories</option>

                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}

                </select>

              </div>

              {/* Location */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>

                <select
                  value={selectedLocation}
                  onChange={(e) => {
                    setSelectedLocation(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >

                  <option value="">All Locations</option>

                  {locations.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}

                </select>

              </div>

              {/* Job Type */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Type
                </label>

                <select
                  value={selectedType}
                  onChange={(e) => {
                    setSelectedType(e.target.value as JobType | '');
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >

                  <option value="">All Types</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="remote">Remote</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>

                </select>

              </div>

              {/* Skills */}
              <div>

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Skill
                </label>

                <select
                  value={selectedSkill}
                  onChange={(e) => {
                    setSelectedSkill(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >

                  <option value="">All Skills</option>

                  {allSkills.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}

                </select>

              </div>

            </div>

          </div>

        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-4">

          <p className="text-sm text-gray-500">

            Showing{' '}

            <span className="font-medium text-gray-900">
              {filteredJobs.length}
            </span>

            {' '}jobs

          </p>

        </div>

        {user && !hasResume && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p>Please upload your resume in your profile before applying for jobs.</p>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="inline-flex items-center justify-center rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        )}

        {/* Jobs Grid */}
        {paginatedJobs.length > 0 ? (

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {paginatedJobs.map((job) => (

              <JobCard 
                key={job.id} 
                job={job}
                isApplied={appliedJobs.has(String(job.id))}
                isApplying={applyingJobs.has(String(job.id))}
                onApply={handleApplyToJob}
                isApplyDisabled={!hasResume}
              />

            ))}

          </div>

        ) : (

          <div className="text-center py-16">

            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />

            <h3 className="text-lg font-semibold text-gray-900">
              No jobs found
            </h3>

            <p className="text-gray-500 mt-1">
              Try adjusting your search or filters
            </p>

          </div>

        )}

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />

      </div>

    </div>

  );
}