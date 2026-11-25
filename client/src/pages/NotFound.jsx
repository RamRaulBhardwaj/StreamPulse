import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <div className="text-6xl font-black text-brand-500 tracking-tighter">404</div>
      <h1 className="text-xl font-bold text-white">Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">
        The requested video or streaming page does not exist or has been removed.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition shadow-sm"
      >
        <Home className="w-4 h-4" />
        <span>Return to Homepage</span>
      </Link>
    </div>
  );
};
