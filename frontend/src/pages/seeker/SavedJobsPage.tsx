import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import JobCard from '../../components/ui/JobCard';
import EmptyState from '../../components/ui/EmptyState';
import { mockJobs } from '../../data/mock';

export default function SavedJobsPage() {
  const savedJobs = mockJobs.slice(0, 4);

  if (savedJobs.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>
        <EmptyState
          icon={<Bookmark className="w-10 h-10" />}
          title="No saved jobs"
          description="Save jobs you're interested in to easily find them later."
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Saved Jobs</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {savedJobs.map(job => (
          <JobCard key={job.id} job={job} isSaved onSave={() => {}} />
        ))}
      </div>
    </div>
  );
}
