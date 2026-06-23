import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, CheckCircle, XCircle, Eye, AlertCircle, Loader } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/AuthContext';
import { applicationApi } from '../../lib/api';
import type { ApplicationStatus } from '../../types';

interface ApplicationData {
  id: string;
  job_id: string;
  seeker_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  created_at: string;
  job: {
    id: string | number;
    title: string;
    company: string;
    location: string;
    description?: string;
  };
}

const statusConfig: Record<ApplicationStatus, { label: string; color: string; icon: typeof Eye }> = {
  applied: { label: 'Applied', color: 'bg-blue-50 text-blue-700', icon: Clock },
  reviewing: { label: 'Under Review', color: 'bg-amber-50 text-amber-700', icon: Eye },
  interview: { label: 'Interview', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle },
  rejected: { label: 'Rejected', color: 'bg-red-50 text-red-700', icon: XCircle },
  offered: { label: 'Offered', color: 'bg-green-50 text-green-700', icon: CheckCircle },
};

export default function MyApplicationsPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!profile?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await applicationApi.getUserApplications(profile.id);
        
        if (response.success && response.applications) {
          setApplications(response.applications);
        } else if (!response.success) {
          setError(response.message || 'Failed to fetch applications');
          setApplications([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch applications';
        setError(errorMessage);
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Loader className="w-10 h-10 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Error Loading Applications</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Applications</h1>
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <div className="text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
          {applications.length} total
        </div>
      </div>

      <div className="space-y-3">
        {applications.map(app => {
          const config = statusConfig[app.status];
          const StatusIcon = config.icon;
          const appliedDate = new Date(app.created_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: new Date(app.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
          });

          return (
            <Link
              key={app.id}
              to={`/jobs/${app.job_id}`}
              className="block bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow hover:border-gray-300"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                    {app.job?.title || 'Job Title'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {app.job?.company || 'Company'} &middot; {app.job?.location || 'Location'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${config.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {config.label}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">Applied {appliedDate}</span>
                </div>
              </div>

              {app.cover_letter && (
                <p className="text-xs text-gray-400 mt-3 line-clamp-1">
                  Cover letter: {app.cover_letter}
                </p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
