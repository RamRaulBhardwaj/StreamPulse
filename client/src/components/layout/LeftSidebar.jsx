import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Radio, Heart } from 'lucide-react';
import { authService } from '../../services/authService.js';
import { useAuth } from '../../hooks/useAuth.js';

export const LeftSidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { user, isAuthenticated } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await authService.getRecommendedChannels();
        setChannels(res.data || []);
      } catch {
        // Fallback or empty state
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const formatViewers = (views) => {
    if (!views) return '1.2K';
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  // Followed channels mapped from user's following list
  const followedChannels = (user?.following || []).map((f) => {
    const fid = (f._id || f.id || f).toString();
    const matching = channels.find((ch) => ch._id === fid);
    if (matching) return matching;
    return {
      _id: fid,
      name: f.name || 'Creator',
      avatar:
        f.avatar ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(f.name || fid)}`,
      category: f.category || 'Vlog',
      views: f.views || 1420,
      isLive: f.isLive || false
    };
  });

  // Recommended channels (excluding followed channels for clean Twitch-style separation)
  const recommendedChannels = channels.filter(
    (ch) => !(user?.following || []).some((f) => (f._id || f.id || f).toString() === ch._id)
  );

  return (
    <aside
      className={`sticky top-[50px] h-[calc(100vh-50px)] bg-twitch-sidebar border-r border-twitch-border flex flex-col shrink-0 select-none transition-all duration-200 z-30 ${
        isCollapsed ? 'w-[50px]' : 'w-60'
      }`}
    >
      {/* Sidebar Header & Collapse Toggle */}
      <div className="h-10 flex items-center justify-between px-3 border-b border-twitch-border">
        {!isCollapsed && (
          <span className="text-xs font-bold uppercase tracking-wider text-twitch-text truncate">
            For You
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1 rounded hover:bg-twitch-card text-twitch-muted hover:text-twitch-text transition mx-auto"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle sidebar width"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Scrollable Channels List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-1 space-y-4">
        {/* Followed Channels Section (if logged in) */}
        {isAuthenticated && followedChannels.length > 0 && (
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-2 pt-2 text-[11px] font-bold uppercase tracking-wider text-twitch-muted flex items-center gap-1">
                <Heart className="w-3 h-3 text-twitch-purple fill-current" />
                <span>Followed Channels</span>
              </div>
            )}
            {followedChannels.map((channel) => (
              <Link
                key={`followed-${channel._id}`}
                to={`/watch/${channel._id}`}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-twitch-card transition group"
                title={`${channel.name} • ${channel.category}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={
                      channel.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(channel.name)}`
                    }
                    alt={channel.name}
                    className="w-8 h-8 rounded-full bg-twitch-card border border-twitch-border object-cover group-hover:ring-2 group-hover:ring-twitch-purple transition"
                  />
                  {channel.isLive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-twitch-live border-2 border-twitch-sidebar" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="min-w-0 pr-1">
                      <div className="text-xs font-semibold text-twitch-text truncate leading-tight group-hover:text-twitch-purple transition">
                        {channel.name}
                      </div>
                      <div className="text-[11px] text-twitch-muted truncate leading-tight">
                        {channel.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[11px] text-twitch-text font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-twitch-live animate-pulse" />
                      <span>{formatViewers(channel.views)}</span>
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}

        {/* Recommended Channels Section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-2 pt-1 text-[11px] font-bold uppercase tracking-wider text-twitch-muted flex items-center gap-1">
              <Radio className="w-3 h-3 text-twitch-live" />
              <span>Recommended Channels</span>
            </div>
          )}

          {loading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex items-center gap-2 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-twitch-card shrink-0" />
                  {!isCollapsed && <div className="h-3 bg-twitch-card rounded flex-1" />}
                </div>
              ))}
            </div>
          ) : (
            recommendedChannels.map((channel) => (
              <Link
                key={`rec-${channel._id}`}
                to={`/watch/${channel._id}`}
                className="flex items-center gap-2 p-1.5 rounded hover:bg-twitch-card transition group"
                title={`${channel.name} • ${channel.category}`}
              >
                <div className="relative shrink-0">
                  <img
                    src={
                      channel.avatar ||
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(channel.name)}`
                    }
                    alt={channel.name}
                    className="w-8 h-8 rounded-full bg-twitch-card border border-twitch-border object-cover group-hover:ring-2 group-hover:ring-twitch-purple transition"
                  />
                  {channel.isLive && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-twitch-live border-2 border-twitch-sidebar" />
                  )}
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 flex items-center justify-between">
                    <div className="min-w-0 pr-1">
                      <div className="text-xs font-semibold text-twitch-text truncate leading-tight group-hover:text-twitch-purple transition">
                        {channel.name}
                      </div>
                      <div className="text-[11px] text-twitch-muted truncate leading-tight">
                        {channel.category}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-[11px] text-twitch-text font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-twitch-live animate-pulse" />
                      <span>{formatViewers(channel.views)}</span>
                    </div>
                  </div>
                )}
              </Link>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
