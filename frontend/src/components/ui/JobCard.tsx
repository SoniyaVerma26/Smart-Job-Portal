import type { Job } from '../../types';
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck, CheckCircle, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSave?: (jobId: string) => void;
  isApplied?: boolean;
  isApplying?: boolean;
  isApplyDisabled?: boolean;
  onApply?: (jobId: string) => Promise<void>;
}

const typeColors: Record<string, string> = {
  'full-time': 'bg-blue-50 text-blue-700',
  'part-time': 'bg-amber-50 text-amber-700',
  'remote': 'bg-emerald-50 text-emerald-700',
  'contract': 'bg-purple-50 text-purple-700',
  'internship': 'bg-pink-50 text-pink-700',
};

export default function JobCard({ job, isSaved, onSave, isApplied, isApplying, isApplyDisabled, onApply }: JobCardProps) {
  const skillsArray: string[] = (() => {
    const s: unknown = job.skills;
    if (!s) return [];
    if (Array.isArray(s)) return s.map((x) => String(x).trim()).filter(Boolean);
    if (typeof s === 'string') return s.split(',').map((x) => x.trim()).filter(Boolean);
    return [];
  })();

  const salaryLabel = job.salary ??
    (job.salary_min != null && job.salary_max != null
      ? `${(job.salary_min / 1000).toFixed(0)}k-${(job.salary_max / 1000).toFixed(0)}k`
      : undefined);

  const postedDate = job.created_at
    ? new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link to={`/jobs/${job.id}`} className="block">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
              {job.title}
            </h3>
          </Link>
          <p className="text-gray-600 mt-0.5 font-medium">{job.company}</p>
        </div>
        {onSave && (
          <button
            onClick={(e) => { e.preventDefault(); onSave(String(job.id)); }}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
            title={isSaved ? 'Unsave job' : 'Save job'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-5 h-5 text-blue-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-400" />
            )}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          {job.location}
        </span>
        {job.type && (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
            {job.type}
          </span>
        )}
        {salaryLabel && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {salaryLabel}
          </span>
        )}
      </div>
<div className="flex flex-wrap gap-1.5 mt-3">
  {skillsArray.slice(0, 4).map((skill, index) => (
    <span
      key={skill + index}
      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium"
    >
      {skill}
    </span>
  ))}

  {skillsArray.length > 4 && (
    <span className="px-2 py-0.5 text-gray-400 text-xs">
      +{skillsArray.length - 4}
    </span>
  )}
</div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 gap-2">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {postedDate}
        </span>
        <div className="flex gap-2">
          <Link
            to={`/jobs/${job.id}`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            View Details
          </Link>
          {onApply && (
            <button
              onClick={(e) => {
                e.preventDefault();
                if (isApplyDisabled || isApplied || isApplying) return;
                onApply(String(job.id));
              }}
              disabled={isApplied || isApplying || isApplyDisabled}
              className={`text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                isApplied
                  ? 'bg-green-50 text-green-700 cursor-default'
                  : isApplying
                    ? 'bg-blue-50 text-blue-600 cursor-wait'
                    : isApplyDisabled
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
              title={isApplied ? 'Already applied' : isApplying ? 'Applying...' : isApplyDisabled ? 'Resume required to apply' : 'Apply for this job'}
            >
              {isApplied ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Applied
                </>
              ) : isApplying ? (
                <>
                  <Send className="w-4 h-4 animate-pulse" />
                  Applying...
                </>
              ) : isApplyDisabled ? (
                <>
                  <Send className="w-4 h-4" />
                  Resume required
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Apply
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
