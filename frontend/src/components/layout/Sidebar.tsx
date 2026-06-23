import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, FileText, Bookmark, User,
  PlusCircle, Users, Settings, Send
} from 'lucide-react';

interface SidebarProps {
  role: 'job_seeker' | 'recruiter';
}

const seekerLinks = [
  { to: '/seeker/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
  { to: '/seeker/applications', label: 'My Applications', icon: Send },
  { to: '/seeker/applied', label: 'Applied Jobs', icon: FileText },
  { to: '/seeker/saved', label: 'Saved Jobs', icon: Bookmark },
  { to: '/profile', label: 'Profile', icon: User },
];

const recruiterLinks = [
  { to: '/recruiter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/recruiter/post-job', label: 'Post Job', icon: PlusCircle },
  { to: '/recruiter/my-jobs', label: 'My Jobs', icon: Briefcase },
  { to: '/recruiter/applicants', label: 'Applicants', icon: Users },
  { to: '/profile', label: 'Profile', icon: Settings },
];

export default function Sidebar({ role }: SidebarProps) {
  const location = useLocation();
  const links = role === 'recruiter' ? recruiterLinks : seekerLinks;

  return (
    <aside className="w-64 min-h-[calc(100vh-4rem)] bg-white border-r border-gray-200 p-4 hidden lg:block">
      <nav className="space-y-1">
        {links.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
