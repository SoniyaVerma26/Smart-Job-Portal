import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import type { ApplicationStatus } from '../../types';

interface MockApplication {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  status: ApplicationStatus;
  appliedAt: string;
}

const mockApplications: MockApplication[] = [
  { id: '1', jobTitle: 'Senior Frontend Developer', company: 'TechNova Inc.', location: 'San Francisco, CA', status: 'reviewing', appliedAt: '2026-04-28' },
  { id: '2', jobTitle: 'Backend Engineer', company: 'CloudSync', location: 'New York, NY', status: 'interview', appliedAt: '2026-04-25' },
  { id: '3', jobTitle: 'Full Stack Developer', company: 'WebSphere Solutions', location: 'Miami, FL', status: 'applied', appliedAt: '2026-04-20' },
];

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: typeof Eye }> = {
  applied: { label: 'Applied', color: 'bg-blue-50 text-blue-700', icon: Clock },
  reviewing: { label: 'Under Review', color: 'bg-amber-50 text-amber-700', icon: Eye },
  interview: { label: 'Interview', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700', icon: XCircle },
  offered: { label: 'Offered', color: 'bg-green-50 text-green-700', icon: CheckCircle },
};

export default function AppliedJobsPage() {
  if (mockApplications.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Applied Jobs</h1>
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="No applications yet"
          description="Start applying to jobs and track your applications here."
          action={
            <Link to="/jobs" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Browse Jobs
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applied Jobs</h1>
      <div className="space-y-3">
        {mockApplications.map(app => {
          const config = statusConfig[app.status];
          const StatusIcon = config.icon;
          return (
            <div key={app.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-gray-900">{app.jobTitle}</h3>
                  <p className="text-sm text-gray-500">{app.company} &middot; {app.location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400">Applied {new Date(app.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
