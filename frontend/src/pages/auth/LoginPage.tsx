import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginWithBackend } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        // invalid credentials or other errors
        setLoading(false);
        alert('Invalid credentials');
        return;
      }
      const data = await res.json();
      // expected backend format: { success: true, message, user: { id, name, email, role, phone, skills } }
      if (!data.success) {
        setLoading(false);
        alert(data.message ?? 'Invalid credentials');
        return;
      }
      // persist the exact backend response mapping to localStorage
      try {
        localStorage.setItem('backendAuth', JSON.stringify(data));
      } catch (e) {
        // ignore storage errors
      }

      const u = data.user ?? {};
      const backendUser = { id: String(u.id ?? ''), email: u.email ?? email };
      const backendProfile = {
        id: String(u.id ?? backendUser.id),
        full_name: u.name ?? '',
        phone: u.phone ?? '',
        role: u.role ?? (u.role as any),
        skills: typeof u.skills === 'string' ? u.skills.split(',').map((s: string) => s.trim()) : Array.isArray(u.skills) ? u.skills : [],
        resume_url: u.resume_url ?? '',
        company: u.company ?? '',
        avatar_url: u.avatar_url ?? '',
        created_at: u.created_at ?? new Date().toISOString(),
      };
      loginWithBackend(backendUser, backendProfile, data.token);
      setLoading(false);
      // map backend role values to frontend routes
      const roleRaw = (data.user?.role ?? backendProfile.role) as string | undefined;
      if (roleRaw === 'JOB_SEEKER') {
        navigate('/seeker/dashboard');
      } else if (roleRaw === 'RECRUITER') {
        navigate('/recruiter/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message ?? 'An unexpected error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600">
            <Briefcase className="w-8 h-8" />
            JobFlow
          </Link>
          <p className="text-gray-500 mt-2">Welcome back. Sign in to your account.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow text-gray-900"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow pr-11 text-gray-900"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
