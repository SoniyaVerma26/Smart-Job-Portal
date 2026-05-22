import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, CreditCard as Edit2, Trash2, Users, PlusCircle } from 'lucide-react';
import { mockJobs } from '../../data/mock';
import EmptyState from '../../components/ui/EmptyState';

export default function MyJobsPage() {
  const [jobs] = useState(mockJobs.slice(0, 5));

  if (jobs.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Jobs</h1>
        <EmptyState
          icon={<Briefcase className="w-10 h-10" />}
          title="No jobs posted yet"
          description="Post your first job to start receiving applications."
          action={
            <Link to="/recruiter/post-job" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <PlusCircle className="w-4 h-4" /> Post a Job
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <Link
          to="/recruiter/post-job"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> Post Job
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {jobs.map(job => (
          <div key={job.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-gray-500">
                <span>{job.location}</span>
                <span>&middot;</span>
                <span>{job.type}</span>
                <span>&middot;</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  {Math.floor(Math.random() * 10) + 1} applicants
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                {job.is_active ? 'Active' : 'Closed'}
              </span>
              <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
