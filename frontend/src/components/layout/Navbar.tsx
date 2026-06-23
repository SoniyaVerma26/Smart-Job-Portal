import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const dashboardPath = profile?.role === 'recruiter' ? '/recruiter/dashboard' : '/seeker/dashboard';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
            <Briefcase className="w-7 h-7" />
            <span>JobFlow</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/jobs" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
              Browse Jobs
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Dashboard
                </Link>
                <Link to="/profile" className="text-gray-600 hover:text-blue-600 transition-colors font-medium flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Profile
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-gray-600">
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-3">
            <Link to="/jobs" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMobileOpen(false)}>
              Browse Jobs
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/profile" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleSignOut} className="text-red-500 font-medium">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block text-gray-600 hover:text-blue-600 font-medium" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/signup" className="block text-blue-600 font-medium" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
