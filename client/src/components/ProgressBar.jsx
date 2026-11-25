export const ProgressBar = ({ progress = 0, loaded = 0, total = 0 }) => {
  const formatMB = (bytes) => (bytes / (1024 * 1024)).toFixed(1);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs font-semibold text-twitch-text">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-twitch-purple animate-pulse" />
          <span>Broadcasting upload to storage...</span>
        </span>
        <span className="text-twitch-purple font-bold">
          {progress}% {total > 0 && `(${formatMB(loaded)} MB / ${formatMB(total)} MB)`}
        </span>
      </div>
      <div className="w-full h-2.5 bg-[#18181B] rounded-full overflow-hidden border border-twitch-border p-0.5">
        <div
          className="h-full bg-twitch-purple rounded-full transition-all duration-200 shadow-sm shadow-twitch-purple/50"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};
