import { Link } from 'react-router-dom';
import { Briefcase, Search, ArrowRight, Users, Building2, TrendingUp } from 'lucide-react';
import { mockJobs } from '../data/mock';
import JobCard from '../components/ui/JobCard';
import Navbar from '../components/layout/Navbar';

export default function HomePage() {
  const featuredJobs = mockJobs.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Find Your Next
              <span className="block text-blue-200">Career Move</span>
            </h1>
            <p className="mt-5 text-lg text-blue-100 leading-relaxed max-w-lg">
              Connect with top companies and discover opportunities that match your skills and ambitions.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                <Search className="w-5 h-5" />
                Browse Jobs
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Briefcase className="w-6 h-6" />, value: '2,500+', label: 'Active Jobs' },
            { icon: <Building2 className="w-6 h-6" />, value: '800+', label: 'Companies' },
            { icon: <Users className="w-6 h-6" />, value: '15,000+', label: 'Job Seekers' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center gap-4 shadow-sm">
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Jobs</h2>
            <p className="text-gray-500 mt-1">Handpicked opportunities for you</p>
          </div>
          <Link to="/jobs" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Explore by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Engineering', count: 842, icon: <TrendingUp className="w-5 h-5" /> },
              { label: 'Design', count: 256, icon: <Briefcase className="w-5 h-5" /> },
              { label: 'Data Science', count: 189, icon: <TrendingUp className="w-5 h-5" /> },
              { label: 'Marketing', count: 312, icon: <Users className="w-5 h-5" /> },
            ].map(cat => (
              <Link
                key={cat.label}
                to={`/jobs?category=${cat.label}`}
                className="p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <div className="text-gray-400 group-hover:text-blue-600 transition-colors mb-3">{cat.icon}</div>
                <p className="font-semibold text-gray-900">{cat.label}</p>
                <p className="text-sm text-gray-500">{cat.count} jobs</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">Ready to take the next step?</h2>
          <p className="text-blue-100 mt-3 max-w-md mx-auto">
            Whether you're hiring or looking for your next role, JobFlow has you covered.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-white text-blue-700 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
            >
              I'm a Job Seeker
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center justify-center border-2 border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/10 transition-colors"
            >
              I'm a Recruiter
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold text-lg">
            <Briefcase className="w-6 h-6" />
            JobFlow
          </div>
          <p className="text-sm">2026 JobFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
