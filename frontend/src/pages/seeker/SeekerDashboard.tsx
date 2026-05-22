import { Link } from 'react-router-dom';
import { Briefcase, FileText, Bookmark, TrendingUp, ArrowRight } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import JobCard from '../../components/ui/JobCard';
import { mockJobs } from '../../data/mock';

export default function SeekerDashboard() {
  const appliedCount = 3;
  const savedCount = 5;
  const recommendedJobs = mockJobs.slice(0, 3);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your job search overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Applied Jobs" value={appliedCount} icon={<FileText className="w-5 h-5" />} color="blue" />
        <StatCard label="Saved Jobs" value={savedCount} icon={<Bookmark className="w-5 h-5" />} color="amber" />
        <StatCard label="Profile Views" value={12} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
      </div>

      {/* Recommended Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recommended for You</h2>
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {recommendedJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[
            { action: 'Applied to', target: 'Senior Frontend Developer', company: 'TechNova Inc.', time: '2 hours ago', icon: <FileText className="w-4 h-4 text-blue-500" /> },
            { action: 'Saved', target: 'Data Scientist', company: 'DataPulse Analytics', time: '1 day ago', icon: <Bookmark className="w-4 h-4 text-amber-500" /> },
            { action: 'Applied to', target: 'Backend Engineer', company: 'CloudSync', time: '3 days ago', icon: <FileText className="w-4 h-4 text-blue-500" /> },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <div className="p-2 bg-gray-50 rounded-lg">{item.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="text-gray-500">{item.action}</span>{' '}
                  <span className="font-medium">{item.target}</span>
                </p>
                <p className="text-xs text-gray-500">{item.company}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/jobs" className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-100 transition-colors">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Browse Jobs</p>
            <p className="text-sm text-gray-500">Find new opportunities</p>
          </div>
        </Link>
        <Link to="/profile" className="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600 group-hover:bg-emerald-100 transition-colors">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Complete Profile</p>
            <p className="text-sm text-gray-500">Improve your visibility</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
