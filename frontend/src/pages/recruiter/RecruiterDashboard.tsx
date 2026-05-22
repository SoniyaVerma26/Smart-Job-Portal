import { Link } from 'react-router-dom';
import { Briefcase, Users, PlusCircle, Eye } from 'lucide-react';
import StatCard from '../../components/ui/StatCard';
import { mockJobs } from '../../data/mock';

export default function RecruiterDashboard() {
  const myJobs = mockJobs.slice(0, 4);
  const totalApplicants = 24;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage your job postings and applicants.</p>
        </div>
        <Link
          to="/recruiter/post-job"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5" /> Post Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Jobs Posted" value={myJobs.length} icon={<Briefcase className="w-5 h-5" />} color="blue" />
        <StatCard label="Total Applicants" value={totalApplicants} icon={<Users className="w-5 h-5" />} color="emerald" />
        <StatCard label="Active Jobs" value={myJobs.filter(j => j.is_active).length} icon={<Eye className="w-5 h-5" />} color="amber" />
      </div>

      {/* Recent Jobs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Job Postings</h2>
          <Link to="/recruiter/my-jobs" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {myJobs.map(job => (
            <div key={job.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4">
              <div>
                <h3 className="font-semibold text-gray-900">{job.title}</h3>
                <p className="text-sm text-gray-500">{job.location} &middot; {job.type}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  {Math.floor(Math.random() * 10) + 1} applicants
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${job.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {job.is_active ? 'Active' : 'Closed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Applicants */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Applicants</h2>
          <Link to="/recruiter/applicants" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View all
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {[
            { name: 'Alice Johnson', job: 'Senior Frontend Developer', date: '2 hours ago' },
            { name: 'Bob Smith', job: 'Backend Engineer', date: '5 hours ago' },
            { name: 'Carol Davis', job: 'Senior Frontend Developer', date: '1 day ago' },
          ].map((applicant, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                {applicant.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{applicant.name}</p>
                <p className="text-xs text-gray-500">Applied for {applicant.job}</p>
              </div>
              <span className="text-xs text-gray-400">{applicant.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
