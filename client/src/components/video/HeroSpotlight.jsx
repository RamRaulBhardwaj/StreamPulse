import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Eye, Radio, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { getThumbnailUrl, handleThumbnailError } from '../../utils/thumbnailUtils.js';

export const HeroSpotlight = ({ liveStreams = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!liveStreams || liveStreams.length === 0) return null;

  const currentStream = liveStreams[currentIndex] || liveStreams[0];

  const handlePrev = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? liveStreams.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === liveStreams.length - 1 ? 0 : prev + 1));
  };

  const thumbnailUrl = getThumbnailUrl(currentStream, currentIndex);

  const formatViews = (count) => {
    if (!count) return '1.4K';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-r from-twitch-sidebar via-twitch-card to-twitch-sidebar border border-twitch-border p-4 sm:p-6 shadow-2xl group">
      {/* Navigation Arrows for Cycling Live Streams */}
      {liveStreams.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/75 hover:bg-twitch-purple text-white flex items-center justify-center transition border border-white/10 shadow-xl opacity-80 hover:opacity-100"
            title="Previous Live Stream"
            aria-label="Previous Live Stream"
          >
            <ChevronLeft className="w-5 h-5 -ml-0.5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-9 h-9 rounded-full bg-black/75 hover:bg-twitch-purple text-white flex items-center justify-center transition border border-white/10 shadow-xl opacity-80 hover:opacity-100"
            title="Next Live Stream"
            aria-label="Next Live Stream"
          >
            <ChevronRight className="w-5 h-5 ml-0.5" />
          </button>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Video / Thumbnail Stage */}
        <div className="lg:col-span-7 relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-twitch-border/80 group/stage">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={currentStream.title}
              onError={handleThumbnailError}
              className="w-full h-full object-cover group-hover/stage:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-twitch-sidebar to-twitch-card text-twitch-muted">
              <Radio className="w-12 h-12 text-twitch-purple animate-pulse mb-2" />
              <span className="text-xs font-bold uppercase tracking-wider text-twitch-text">
                {currentStream.category} Live Broadcast
              </span>
            </div>
          )}

          {/* Red LIVE badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-twitch-live text-white text-xs font-extrabold tracking-wider uppercase shadow-md">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span>LIVE</span>
          </div>

          {/* Dark Viewer pill */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
            <Eye className="w-3.5 h-3.5 text-twitch-live" />
            <span>{formatViews(currentStream.views)} viewers</span>
          </div>

          <Link
            to={`/watch/${currentStream._id}`}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/stage:opacity-100 transition"
          >
            <div className="w-14 h-14 rounded-full bg-twitch-purple text-white flex items-center justify-center shadow-xl shadow-twitch-purple/40 scale-90 group-hover/stage:scale-100 transition">
              <Play className="w-6 h-6 ml-1 fill-current" />
            </div>
          </Link>
        </div>

        {/* Right Stream Spotlight Meta */}
        <div className="lg:col-span-5 space-y-4">
          {/* Creator Info: Avatar + Plain Channel Name (No Badges) */}
          <div className="flex items-center gap-3">
            <img
              src={
                currentStream.creator?.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(currentStream.creator?.name || 'Creator')}`
              }
              alt={currentStream.creator?.name}
              className="w-12 h-12 rounded-full border-2 border-twitch-purple object-cover bg-twitch-card shrink-0"
            />
            <div className="min-w-0">
              {/* Plain Channel Name - No Badges! */}
              <h3 className="text-base font-bold text-twitch-text leading-snug truncate hover:text-twitch-purple transition">
                {currentStream.creator?.name || 'Streamer'}
              </h3>
              <p className="text-xs text-twitch-purple font-semibold">
                {currentStream.category}
              </p>
            </div>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-twitch-text leading-tight line-clamp-2">
            {currentStream.title}
          </h2>

          <p className="text-xs text-twitch-muted line-clamp-3 leading-relaxed">
            {currentStream.description || 'Watch live streaming powered by Node.js HTTP 206 Partial Content byte ranges.'}
          </p>

          {currentStream.tags && currentStream.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="w-3 h-3 text-twitch-muted" />
              {currentStream.tags.slice(0, 4).map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-twitch-card text-twitch-muted border border-twitch-border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Row & Carousel Indicators */}
          <div className="flex items-center justify-between pt-2">
            <Link
              to={`/watch/${currentStream._id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-twitch-purple hover:bg-twitch-purple-hover text-white transition shadow-lg shadow-twitch-purple/20"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Watch Live</span>
            </Link>

            {/* Live Stream Index Indicators */}
            {liveStreams.length > 1 && (
              <div className="flex items-center gap-1.5">
                {liveStreams.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentIndex
                        ? 'w-6 bg-twitch-purple'
                        : 'w-2 bg-twitch-border hover:bg-twitch-muted'
                    }`}
                    title={`Live stream ${idx + 1}`}
                    aria-label={`Go to live stream ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
