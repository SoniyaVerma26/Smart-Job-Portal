import { Users } from 'lucide-react';
import EmptyState from '../../components/ui/EmptyState';
import type { ApplicationStatus } from '../../types';

interface MockApplicant {
  id: string;
  name: string;
  email: string;
  jobTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  skills: string[];
}

const mockApplicants: MockApplicant[] = [
  { id: '1', name: 'Alice Johnson', email: 'alice@example.com', jobTitle: 'Senior Frontend Developer', status: 'reviewing', appliedAt: '2026-04-28', skills: ['React', 'TypeScript', 'Next.js'] },
  { id: '2', name: 'Bob Smith', email: 'bob@example.com', jobTitle: 'Backend Engineer', status: 'interview', appliedAt: '2026-04-25', skills: ['Java', 'Spring Boot', 'PostgreSQL'] },
  { id: '3', name: 'Carol Davis', email: 'carol@example.com', jobTitle: 'Senior Frontend Developer', status: 'applied', appliedAt: '2026-04-24', skills: ['React', 'Vue', 'CSS'] },
  { id: '4', name: 'David Lee', email: 'david@example.com', jobTitle: 'Backend Engineer', status: 'offered', appliedAt: '2026-04-20', skills: ['Node.js', 'Python', 'AWS'] },
  { id: '5', name: 'Eva Martinez', email: 'eva@example.com', jobTitle: 'Senior Frontend Developer', status: 'rejected', appliedAt: '2026-04-18', skills: ['Angular', 'RxJS', 'SCSS'] },
];

const statusColors: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-50 text-blue-700',
  reviewing: 'bg-amber-50 text-amber-700',
  interview: 'bg-emerald-50 text-emerald-700',
  rejected: 'bg-red-50 text-red-700',
  offered: 'bg-green-50 text-green-700',
};

export default function ApplicantsPage() {
  if (mockApplicants.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Applicants</h1>
        <EmptyState
          icon={<Users className="w-10 h-10" />}
          title="No applicants yet"
          description="Applicants will appear here once they apply to your job postings."
        />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Applicants</h1>
      <div className="space-y-3">
        {mockApplicants.map(applicant => (
          <div key={applicant.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm shrink-0">
                  {applicant.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{applicant.name}</h3>
                  <p className="text-sm text-gray-500">{applicant.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[applicant.status]}`}>
                  {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-500">Applied for <span className="font-medium text-gray-700">{applicant.jobTitle}</span></p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {applicant.skills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{skill}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
