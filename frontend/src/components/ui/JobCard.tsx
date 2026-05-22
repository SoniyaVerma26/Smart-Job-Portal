import type { Job } from '../../types';
import { MapPin, Clock, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
  onSave?: (jobId: string) => void;
}

const typeColors: Record<string, string> = {
  'full-time': 'bg-blue-50 text-blue-700',
  'part-time': 'bg-amber-50 text-amber-700',
  'remote': 'bg-emerald-50 text-emerald-700',
  'contract': 'bg-purple-50 text-purple-700',
  'internship': 'bg-pink-50 text-pink-700',
};

export default function JobCard({ job, isSaved, onSave }: JobCardProps) {
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
            onClick={(e) => { e.preventDefault(); onSave(job.id); }}
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
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColors[job.type] || 'bg-gray-100 text-gray-600'}`}>
          {job.type}
        </span>
        {job.salary_max > 0 && (
          <span className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {(job.salary_min / 1000).toFixed(0)}k-{(job.salary_max / 1000).toFixed(0)}k
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {job.skills.slice(0, 4).map(skill => (
          <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">
            {skill}
          </span>
        ))}
        {job.skills.length > 4 && (
          <span className="px-2 py-0.5 text-gray-400 text-xs">+{job.skills.length - 4}</span>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          {new Date(job.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </span>
        <Link
          to={`/jobs/${job.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
