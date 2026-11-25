import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Alert } from '../components/Alert.jsx';
import { validateEmailFormatAndBlocklist } from '../utils/authValidation.js';

export const Login = () => {
  const { login, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    clearError();

    const errors = {};

    if (!email.trim()) {
      errors.email = 'Email is invalid';
    } else {
      const emailCheck = validateEmailFormatAndBlocklist(email, { isLogin: true });
      if (!emailCheck.valid) {
        errors.email = emailCheck.error;
      }
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      const serverErr = result.error || 'Login failed';
      const serverErrors = result.errors || [];
      const newFieldErrors = {};

      if (
        serverErr === 'Email is invalid' ||
        serverErrors.some(
          (err) => err.field === 'email' || err.message === 'Email is invalid'
        )
      ) {
        newFieldErrors.email = 'Email is invalid';
      }

      if (
        serverErr.includes('password') &&
        !serverErr.includes('Invalid email or password')
      ) {
        newFieldErrors.password = serverErr;
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
      } else {
        setGeneralError(serverErr);
      }
    }
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setFieldErrors({});
    setGeneralError(null);
    clearError();
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-twitch-card border border-twitch-border rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded bg-twitch-purple text-white mx-auto flex items-center justify-center shadow-md shadow-twitch-purple/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-xl font-black text-twitch-text tracking-tight pt-2">
            Log in to StreamPulse
          </h1>
          <p className="text-xs text-twitch-muted">
            Access your creator dashboard or watch and chat on live streams.
          </p>
        </div>

        {(generalError || error) && (
          <Alert
            type="error"
            message={generalError || error}
            onClose={() => {
              setGeneralError(null);
              clearError();
            }}
          />
        )}

        {/* Form with noValidate to disable browser popup tooltips */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-twitch-text">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
              }}
              className={`w-full bg-[#18181B] border rounded px-3 py-2 text-xs sm:text-sm text-twitch-text placeholder-twitch-muted focus:outline-none transition ${
                fieldErrors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-twitch-border focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple'
              }`}
            />
            {fieldErrors.email && (
              <p className="text-xs text-red-500 font-semibold">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-twitch-text">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
              }}
              className={`w-full bg-[#18181B] border rounded px-3 py-2 text-xs sm:text-sm text-twitch-text placeholder-twitch-muted focus:outline-none transition ${
                fieldErrors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-twitch-border focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple'
              }`}
            />
            {fieldErrors.password && (
              <p className="text-xs text-red-500 font-semibold">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded font-bold text-xs uppercase tracking-wider bg-twitch-purple hover:bg-twitch-purple-hover text-white disabled:opacity-50 transition shadow-lg shadow-twitch-purple/20"
          >
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Section */}
        <div className="pt-4 border-t border-twitch-border space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-twitch-muted text-center">
            Demo Account:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('viewer@example.com', 'password123')}
              className="px-2 py-2 bg-[#18181B] hover:bg-twitch-border border border-twitch-border rounded text-xs font-bold text-blue-400 transition"
            >
              Viewer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@example.com', 'password123')}
              className="px-2 py-2 bg-[#18181B] hover:bg-twitch-border border border-twitch-border rounded text-xs font-bold text-red-400 transition"
            >
              Admin
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-twitch-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-twitch-purple hover:underline font-bold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
