import { Link } from 'react-router-dom';
import { Eye, Heart, Play } from 'lucide-react';
import { getThumbnailUrl, handleThumbnailError } from '../utils/thumbnailUtils.js';

export const VideoCard = ({ video, index = 0 }) => {
  const thumbnailUrl = getThumbnailUrl(video, index);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="group flex flex-col bg-slate-900/60 rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition duration-200 hover:shadow-xl hover:shadow-brand-500/5">
      {/* Thumbnail Container */}
      <Link
        to={`/watch/${video._id}`}
        className="relative aspect-video w-full bg-slate-950 overflow-hidden block"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            onError={handleThumbnailError}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-slate-500">
            <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-brand-400 group-hover:border-brand-500/50 transition">
              <Play className="w-5 h-5 ml-0.5 fill-current" />
            </div>
            <span className="text-[11px] font-medium text-slate-400 mt-2">
              {video.category}
            </span>
          </div>
        )}

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-md text-brand-400 border border-brand-500/30">
          {video.category}
        </span>

        {/* Hover Play Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-brand-500/90 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 scale-90 group-hover:scale-100 transition">
            <Play className="w-5 h-5 ml-0.5 fill-current" />
          </div>
        </div>
      </Link>

      {/* Video Details */}
      <div className="p-3.5 flex gap-3">
        {/* Creator Avatar */}
        <div className="shrink-0">
          <img
            src={
              video.creator?.avatar ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(video.creator?.name || 'Creator')}`
            }
            alt={video.creator?.name || 'Creator'}
            className="w-9 h-9 rounded-full object-cover border border-slate-700 bg-slate-800"
          />
        </div>

        {/* Content Metadata */}
        <div className="flex-1 min-w-0">
          <Link
            to={`/watch/${video._id}`}
            className="text-sm font-semibold text-slate-100 hover:text-brand-400 line-clamp-2 leading-snug transition"
            title={video.title}
          >
            {video.title}
          </Link>

          <div className="text-xs text-slate-400 mt-1 truncate">
            {video.creator?.name || 'Anonymous Creator'}
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {video.views || 0} views
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />
              {video.likesCount || (video.likes ? video.likes.length : 0)}
            </span>
            <span>•</span>
            <span>{formatDate(video.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
