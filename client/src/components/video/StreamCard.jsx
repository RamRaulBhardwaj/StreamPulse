import { Link } from 'react-router-dom';
import { Eye, Radio, Clock, Heart } from 'lucide-react';
import { getThumbnailUrl, handleThumbnailError } from '../../utils/thumbnailUtils.js';

export const StreamCard = ({ video, index = 0 }) => {
  const thumbnailUrl = getThumbnailUrl(video, index);

  const formatViews = (views) => {
    if (!views) return '1.2K';
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <div className="flex flex-col space-y-2 select-none group">
      {/* Twitch Purple Corner-Offset Frame Wrapper */}
      <div className="relative bg-twitch-purple rounded-lg transition">
        {/* Inner Thumbnail Container shifting -translate-y-1 translate-x-1 on hover */}
        <Link
          to={`/watch/${video._id}`}
          className="relative aspect-video w-full rounded-lg overflow-hidden bg-twitch-card border border-twitch-border block transform transition-transform duration-150 ease-out group-hover:-translate-y-1 group-hover:translate-x-1 shadow-lg"
        >
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              onError={handleThumbnailError}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-twitch-sidebar to-twitch-card text-twitch-muted">
              <Radio className="w-8 h-8 text-twitch-purple mb-1 group-hover:scale-110 transition" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-twitch-text">
                {video.category}
              </span>
            </div>
          )}

          {/* Conditional: LIVE Badge OR Duration Badge */}
          {video.isLive ? (
            <>
              {/* Top-left LIVE badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-twitch-live text-white text-[10px] font-extrabold uppercase tracking-wider shadow">
                <span>LIVE</span>
              </div>

              {/* Bottom-left Viewers pill */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-white text-[10px] font-semibold border border-white/10">
                <Eye className="w-3 h-3 text-twitch-live" />
                <span>{formatViews(video.views)} viewers</span>
              </div>
            </>
          ) : (
            <>
              {/* Normal-length Video: Bottom-Right Duration Badge */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/90 backdrop-blur-sm text-white text-[10px] font-bold border border-white/15 shadow">
                <Clock className="w-2.5 h-2.5 text-twitch-muted" />
                <span>{video.duration || '12:30'}</span>
              </div>

              {/* Bottom-left Views & Popularity Likes pill */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-twitch-text text-[10px] font-medium border border-white/10">
                <span>{formatViews(video.views)} views</span>
                {(video.likesCount > 0 || (video.likes && video.likes.length > 0)) && (
                  <span className="flex items-center gap-0.5 text-rose-400 font-semibold border-l border-white/20 pl-1.5">
                    <Heart className="w-2.5 h-2.5 fill-current" />
                    <span>{formatViews(video.likesCount || video.likes.length)}</span>
                  </span>
                )}
              </div>
            </>
          )}

          {/* Top-right HD tag */}
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-twitch-text text-[9px] font-bold border border-white/10">
            HD
          </div>
        </Link>
      </div>

      {/* Stream / Video Meta Details */}
      <div className="flex items-start gap-2.5 pt-1">
        <Link to={`/watch/${video._id}`} className="shrink-0 mt-0.5">
          <img
            src={
              video.creator?.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(video.creator?.name || 'Channel')}`
            }
            alt={video.creator?.name || 'Channel'}
            className="w-9 h-9 rounded-full bg-twitch-card border border-twitch-border object-cover group-hover:ring-2 group-hover:ring-twitch-purple transition"
          />
        </Link>

        <div className="flex-1 min-w-0">
          <Link
            to={`/watch/${video._id}`}
            className="text-xs sm:text-sm font-bold text-twitch-text hover:text-twitch-purple truncate block leading-snug transition"
            title={video.title}
          >
            {video.title}
          </Link>

          {/* Plain Channel Name - No Badges! */}
          <div className="text-xs text-twitch-muted truncate mt-0.5 hover:text-twitch-text transition">
            {video.creator?.name || 'Creator'}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-twitch-muted hover:text-twitch-purple transition font-medium">
              {video.category}
            </span>
            {video.tags && video.tags.length > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-twitch-card text-twitch-muted border border-twitch-border">
                #{video.tags[0]}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
