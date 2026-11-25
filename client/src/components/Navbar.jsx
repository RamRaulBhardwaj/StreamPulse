import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Upload, LayoutDashboard, LogIn, LogOut, Video as VideoIcon } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('search') || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/');
    }
  };

  const isCreator = user && user.role === 'creator';
  const isCreatorOrAdmin = user && (user.role === 'creator' || user.role === 'admin');

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 group-hover:scale-105 transition">
            <VideoIcon className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              StreamPulse
            </span>
            <span className="hidden sm:inline-block ml-1.5 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-400 border border-brand-500/30">
              JS Pure
            </span>
          </div>
        </Link>

        {/* Global Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 max-w-lg mx-2 hidden sm:flex items-center relative"
        >
          <input
            type="text"
            placeholder="Search videos, tags, topics..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-full pl-4 pr-10 py-1.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
          />
          <button
            type="submit"
            className="absolute right-1 text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>

        {/* Right Navigation & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              {/* Creator Actions */}
              {isCreatorOrAdmin && (
                <Link
                  to="/upload"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm hover:shadow-brand-500/20"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </Link>
              )}

              {isCreator && (
                <Link
                  to="/dashboard"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition border border-slate-700/60"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}

              {/* User Profile Badge */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border border-slate-700 object-cover bg-slate-800"
                />
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-medium text-slate-200 leading-tight truncate max-w-[100px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-brand-400 capitalize">
                    {user.role}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              >
                <LogIn className="w-4 h-4" />
                <span>Log in</span>
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
