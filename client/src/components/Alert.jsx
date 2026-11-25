import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';

export const Alert = ({ type = 'error', message, onClose, className = '' }) => {
  if (!message) return null;

  const styles = {
    error: 'bg-rose-950/80 border-rose-500/50 text-rose-200',
    success: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200',
    info: 'bg-twitch-sidebar border-twitch-purple/50 text-twitch-purple'
  };

  const icons = {
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    success: <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-twitch-purple shrink-0" />
  };

  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-md border text-xs font-semibold ${styles[type] || styles.error} ${className}`}
    >
      {icons[type]}
      <div className="flex-1">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-twitch-muted hover:text-white transition p-0.5"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
