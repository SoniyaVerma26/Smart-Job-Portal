import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Profile, UserRole } from '../types';

interface AuthUser {
  id: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, role: UserRole, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  loginWithBackend: (user: AuthUser, profile: Partial<Profile>, token?: string) => void;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const API_BASE_URL = 'http://localhost:8080';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseBackendProfile(backendProfile: any): Profile {
  const skillsRaw = backendProfile?.skills;
  let skills: string[] = [];
  if (typeof skillsRaw === 'string') {
    skills = skillsRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
  } else if (Array.isArray(skillsRaw)) {
    skills = skillsRaw;
  }

  const roleRaw = backendProfile?.role as string | undefined;
  const role = roleRaw === 'JOB_SEEKER' ? 'job_seeker' : roleRaw === 'RECRUITER' ? 'recruiter' : (roleRaw as UserRole | undefined) ?? 'job_seeker';

  return {
    id: String(backendProfile?.id ?? ''),
    full_name: backendProfile?.full_name ?? backendProfile?.name ?? '',
    phone: backendProfile?.phone ?? '',
    role,
    skills,
    resume_url: backendProfile?.resume_url ?? backendProfile?.resumeUrl ?? '',
    company: backendProfile?.company ?? '',
    avatar_url: backendProfile?.avatar_url ?? '',
    created_at: backendProfile?.created_at ?? new Date().toISOString(),
  };
}

function getBackendAuth(): { token?: string; user?: AuthUser; profile?: any } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('backendAuth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.token || !parsed.user) return null;
    return {
      token: parsed.token,
      user: { id: String(parsed.user.id ?? ''), email: parsed.user.email ?? '' },
      profile: parsed.user,
    };
  } catch (e) {
    console.warn('Failed to parse backendAuth from localStorage', e);
    return null;
  }
}

async function fetchBackendProfile(userId: string, token: string): Promise<Profile | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.success && data.user) {
      return parseBackendProfile(data.user);
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch backend profile', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const backendAuth = getBackendAuth();
      if (backendAuth?.token && backendAuth.user) {
        setUser(backendAuth.user);
        const backendProfile = await fetchBackendProfile(backendAuth.user.id, backendAuth.token);
        if (backendProfile) {
          setProfile(backendProfile);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const signUp = async (email: string, password: string, role: UserRole, fullName: string) => {
    try {
      const backendRole = role === 'job_seeker' ? 'JOB_SEEKER' : 'RECRUITER';
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: fullName, email, password, role: backendRole }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return { error: data.message ?? 'Signup failed' };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err?.message ?? 'Signup failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        return { error: data.message ?? 'Login failed' };
      }

      const u = data.user ?? {};
      const backendUser = { id: String(u.id ?? ''), email: u.email ?? email };
      const backendProfile = {
        id: String(u.id ?? backendUser.id),
        full_name: u.name ?? '',
        phone: u.phone ?? '',
        role: u.role ?? '',
        skills: typeof u.skills === 'string' ? u.skills.split(',').map((s: string) => s.trim()) : Array.isArray(u.skills) ? u.skills : [],
        resume_url: u.resume_url ?? '',
        company: u.company ?? '',
        avatar_url: u.avatar_url ?? '',
        created_at: u.created_at ?? new Date().toISOString(),
      };

      loginWithBackend(backendUser, backendProfile, data.token);
      try {
        localStorage.setItem('backendAuth', JSON.stringify({ token: data.token, user: backendUser }));
      } catch (e) {
        // ignore storage errors
      }
      return { error: null };
    } catch (err: any) {
      return { error: err?.message ?? 'Login failed' };
    }
  };

  const loginWithBackend = (backendUser: AuthUser, backendProfile: Partial<Profile>, token?: string) => {
    setUser(backendUser);
    const roleRaw = (backendProfile?.role as unknown) as string | undefined;
    const role = roleRaw === 'JOB_SEEKER' ? 'job_seeker' : roleRaw === 'RECRUITER' ? 'recruiter' : (backendProfile?.role as UserRole | undefined);
    const mergedProfile: Profile = {
      id: backendProfile.id ?? backendUser.id,
      full_name: backendProfile.full_name ?? '',
      phone: backendProfile.phone ?? '',
      role: (role as UserRole) ?? 'job_seeker',
      skills: backendProfile.skills ?? [],
      resume_url: (backendProfile as any)?.resume_url ?? (backendProfile as any)?.resumeUrl ?? '',
      company: backendProfile.company ?? '',
      avatar_url: backendProfile.avatar_url ?? '',
      created_at: backendProfile.created_at ?? new Date().toISOString(),
    };
    setProfile(mergedProfile);
    if (token) {
      try {
        localStorage.setItem('backendAuth', JSON.stringify({ token, user: backendUser }));
      } catch (e) {
        // ignore storage errors
      }
    }
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
    try {
      localStorage.removeItem('backendAuth');
      localStorage.removeItem('backendSignup');
    } catch (e) {
      // ignore storage errors
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };
    const backendAuth = getBackendAuth();
    if (!backendAuth?.token) {
      return { error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendAuth.token}`,
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        return { error: data.message ?? 'Failed to update profile' };
      }

      if (data.user) {
        const normalizedProfile = parseBackendProfile(data.user);
        setProfile(prev => prev ? { ...prev, ...normalizedProfile } : normalizedProfile);
      }

      return { error: null };
    } catch (err: any) {
      return { error: err?.message ?? 'Failed to update profile' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, loginWithBackend, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
