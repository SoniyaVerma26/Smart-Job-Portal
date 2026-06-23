import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockJobs } from '../data/mock';
import { applicationApi } from '../lib/api';
import Navbar from '../components/layout/Navbar';
import {
  MapPin, Clock, DollarSign, ArrowLeft, Bookmark, BookmarkCheck,
  CheckCircle, Building2, Briefcase
} from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Job } from '../types';

const typeColors: Record<string, string> = {
  'full-time': 'bg-blue-50 text-blue-700',
  'part-time': 'bg-amber-50 text-amber-700',
  'remote': 'bg-emerald-50 text-emerald-700',
  'contract': 'bg-purple-50 text-purple-700',
  'internship': 'bg-pink-50 text-pink-700',
};

const normalizeSkills = (skills: string | string[] | undefined): string[] => {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills.map((s) => String(s).trim()).filter(Boolean);
  return String(skills).split(',').map((s) => s.trim()).filter(Boolean);
};

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [applied, setApplied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resumeUrl = (profile?.resume_url?.trim() || '').trim();
  const hasResume = Boolean(resumeUrl);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch('http://localhost:8080/jobs')
      .then((res) => res.json())
      .then((data) => {
        const foundJob = (data.jobs || []).find((j: any) => String(j.id) === id);
        if (foundJob) {
          setJob(foundJob);
          return;
        }

        const fallbackJob = mockJobs.find((j) => String(j.id) === id);
        setJob(fallbackJob || null);
      })
      .catch(() => {
        const fallbackJob = mockJobs.find((j) => String(j.id) === id);
        setJob(fallbackJob || null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Loading job...</h2>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Job not found</h2>
          <Link to="/jobs" className="text-blue-600 mt-2 inline-block">Browse all jobs</Link>
        </div>
      </div>
    );
  }

  const handleApply = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!hasResume) {
      alert('Please upload your resume in your profile before applying for jobs.');
      navigate('/profile');
      return;
    }
    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    if (!user?.id || !job?.id) return;
    if (!hasResume) {
      alert('Please upload your resume in your profile before applying for jobs.');
      navigate('/profile');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await applicationApi.applyToJob(job.id, user.id, resumeUrl, coverLetter);
      if (response.success) {
        setApplied(true);
        setShowApplyModal(false);
        setCoverLetter('');
        alert('Application submitted successfully!');
      } else {
        alert(response.message || 'Failed to submit application');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit application';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const salaryLabel = job.salary ??
    (job.salary_min != null && job.salary_max != null
      ? `${(job.salary_min / 1000).toFixed(0)}k-${(job.salary_max / 1000).toFixed(0)}k`
      : undefined);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-500 hover:text-gray-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        {!hasResume && user && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p>Please upload your resume in your profile before applying for jobs.</p>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="mt-3 inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-white hover:bg-amber-700 transition-colors"
            >
              Complete Profile
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-gray-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                  {job.type && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
                      {job.type}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setSaved(!saved)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl border font-medium transition-all ${
                    saved
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  {saved ? 'Saved' : 'Save'}
                </button>
                {applied ? (
                  <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-medium border border-emerald-200">
                    <CheckCircle className="w-4 h-4" /> Applied
                  </div>
                ) : hasResume ? (
                  <button
                    onClick={handleApply}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Briefcase className="w-4 h-4" /> Apply Now
                  </button>
                ) : (
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
                  >
                    <Briefcase className="w-4 h-4" /> Complete Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 md:p-8 space-y-8">
            {/* Salary & Posted */}
            <div className="flex flex-wrap gap-6">
              {salaryLabel && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Salary</p>
                    <p className="font-semibold text-gray-900">{salaryLabel}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Posted</p>
                  <p className="font-semibold text-gray-900">
                    {job.created_at ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{job.description}</p>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
              <ul className="space-y-2">
                {(job.requirements || []).map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {normalizeSkills(job.skills).map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Apply for {job.title}</h3>
            <p className="text-gray-500 text-sm mb-5">at {job.company}</p>
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Cover Letter (optional)</label>
              <textarea
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                disabled={isSubmitting}
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900 resize-none disabled:bg-gray-50"
                placeholder="Tell the recruiter why you're a great fit..."
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowApplyModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
