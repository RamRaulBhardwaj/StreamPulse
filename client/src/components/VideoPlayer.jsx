import { useState, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

export const VideoPlayer = ({ videoId, posterUrl }) => {
  const [streamError, setStreamError] = useState(false);
  const videoRef = useRef(null);

  const streamSrc = `/api/videos/stream/${videoId}`;

  const handleError = () => {
    setStreamError(true);
  };

  return (
    <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
      {streamError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 text-slate-300">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-2 animate-bounce" />
          <h3 className="text-base font-semibold text-white">Stream Playback Failed</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            Could not receive HTTP 206 chunk stream from server. Check server connection or video encoding.
          </p>
          <button
            onClick={() => {
              setStreamError(false);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play();
              }
            }}
            className="mt-4 px-4 py-1.5 text-xs font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition"
          >
            Retry Playback
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
          onError={handleError}
          className="w-full h-full object-contain focus:outline-none"
        >
          Your browser does not support HTML5 video streaming.
        </video>
      )}
    </div>
  );
};
