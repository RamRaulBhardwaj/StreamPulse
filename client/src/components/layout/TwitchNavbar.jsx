import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Radio, Video, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';

export const TwitchNavbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Sync search input if URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  const isCreator = user && user.role === 'creator';
  const isCreatorOrAdmin = user && (user.role === 'creator' || user.role === 'admin');
  const isBrowse = location.pathname === '/' && !location.search.includes('filter=following');
  const isFollowing = location.search.includes('filter=following');

  return (
    <header className="sticky top-0 z-50 h-[50px] bg-twitch-sidebar border-b border-twitch-border flex items-center justify-between px-3 select-none">
      {/* Left: Glitch Broadcast Logo & Navigation Links */}
      <div className="flex items-center gap-4 sm:gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-twitch-purple flex items-center justify-center text-white shadow-md shadow-twitch-purple/20 group-hover:bg-twitch-purple-hover transition">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
        </Link>

        {/* Following & Browse Tabs with active purple bottom underline */}
        <nav className="flex items-center gap-4 text-sm font-semibold">
          <Link
            to="/?filter=following"
            className={`h-[50px] flex items-center px-1 border-b-2 transition ${
              isFollowing
                ? 'border-twitch-purple text-twitch-purple'
                : 'border-transparent text-twitch-text hover:text-twitch-purple'
            }`}
          >
            Following
          </Link>
          <Link
            to="/"
            className={`h-[50px] flex items-center px-1 border-b-2 transition ${
              isBrowse
                ? 'border-twitch-purple text-twitch-purple'
                : 'border-transparent text-twitch-text hover:text-twitch-purple'
            }`}
          >
            Browse
          </Link>
        </nav>
      </div>

      {/* Center: Compact Dark Search Bar */}
      <form
        onSubmit={handleSearch}
        className="flex-1 max-w-sm sm:max-w-md mx-2 flex items-center"
      >
        <div className="relative w-full flex items-center">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181B] border border-twitch-border rounded-l-md px-3 py-1.5 text-xs sm:text-sm text-twitch-text placeholder-twitch-muted focus:outline-none focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple transition"
          />
          <button
            type="submit"
            className="bg-twitch-card border-y border-r border-twitch-border rounded-r-md px-3 py-1.5 text-twitch-muted hover:text-twitch-text hover:bg-twitch-border/60 transition flex items-center justify-center"
            title="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Right: Creator Studio + User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {isAuthenticated ? (
          <>
            {isCreatorOrAdmin && (
              <Link
                to="/upload"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded bg-twitch-card hover:bg-twitch-border text-twitch-text border border-twitch-border transition"
                title="Creator Studio Upload"
              >
                <Video className="w-3.5 h-3.5 text-twitch-purple" />
                <span>Creator Studio</span>
              </Link>
            )}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-twitch-purple"
              >
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`
                  }
                  alt={user.name}
                  className="w-7 h-7 rounded-full bg-twitch-card border border-twitch-border object-cover"
                />
              </button>

              {showDropdown && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-twitch-card border border-twitch-border rounded-lg shadow-2xl py-1 z-50 text-xs"
                  onMouseLeave={() => setShowDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-twitch-border">
                    <p className="font-bold text-twitch-text truncate">{user.name}</p>
                    <p className="text-[10px] text-twitch-purple font-semibold uppercase">
                      {user.role}
                    </p>
                  </div>

                  {isCreator && (
                    <Link
                      to="/dashboard"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-twitch-text hover:bg-twitch-border/60 transition"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-twitch-purple" />
                      <span>Creator Dashboard</span>
                    </Link>
                  )}

                  {isCreatorOrAdmin && (
                    <Link
                      to="/upload"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-3 py-2 text-twitch-text hover:bg-twitch-border/60 transition"
                    >
                      <Video className="w-3.5 h-3.5 text-twitch-purple" />
                      <span>Upload Stream</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-twitch-border/60 transition border-t border-twitch-border/60"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded bg-twitch-card hover:bg-twitch-border text-twitch-text border border-twitch-border transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Log In</span>
              </Link>
              <Link
                to="/register"
                className="px-3 py-1 text-xs font-semibold rounded bg-twitch-purple hover:bg-twitch-purple-hover text-white transition shadow-sm"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </header>
  );
};
