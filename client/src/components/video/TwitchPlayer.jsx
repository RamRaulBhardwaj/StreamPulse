import { useState, useRef } from 'react';
import { AlertCircle, Maximize2, Minimize2 } from 'lucide-react';
import { videoService } from '../../services/videoService.js';

export const TwitchPlayer = ({
  videoId,
  posterUrl,
  isTheaterMode,
  onToggleTheater
}) => {
  const [streamError, setStreamError] = useState(false);
  const videoRef = useRef(null);

  const streamSrc = videoService.getStreamUrl(videoId);

  const handleRetry = () => {
    setStreamError(false);
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  };

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden border border-twitch-border group shadow-2xl">
      {/* 16:9 Cinema Aspect Ratio */}
      <div className="relative aspect-video w-full">
        {streamError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-twitch-sidebar/95 text-twitch-text">
            <AlertCircle className="w-12 h-12 text-twitch-live mb-2 animate-bounce" />
            <h3 className="text-sm font-bold text-white">Stream Playback Failed</h3>
            <p className="text-xs text-twitch-muted mt-1 max-w-sm">
              Could not receive HTTP 206 Partial Content video stream. Check file encoding or server connection.
            </p>
            <button
              onClick={handleRetry}
              className="mt-4 px-4 py-1.5 text-xs font-bold rounded bg-twitch-purple hover:bg-twitch-purple-hover text-white transition"
            >
              Retry Stream
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={streamSrc}
            poster={posterUrl || undefined}
            controls
            autoPlay
            playsInline
            onError={() => setStreamError(true)}
            className="w-full h-full object-contain focus:outline-none"
          >
            Your browser does not support HTML5 video streaming.
          </video>
        )}

        {/* Theater Mode Overlay Toggle Button */}
        {onToggleTheater && (
          <button
            onClick={onToggleTheater}
            className="absolute top-3 right-3 p-1.5 rounded bg-black/60 hover:bg-black/80 text-white opacity-0 group-hover:opacity-100 transition border border-white/10 z-20"
            title={isTheaterMode ? 'Exit Theater Mode' : 'Theater Mode (Alt+T)'}
            aria-label="Toggle Theater Mode"
          >
            {isTheaterMode ? (
              <Minimize2 className="w-4 h-4 text-twitch-purple" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
