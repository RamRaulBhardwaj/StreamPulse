import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { Alert } from '../components/Alert.jsx';
import {
  validateEmailFormatAndBlocklist,
  validatePassword
} from '../utils/authValidation.js';

export const Register = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);
    clearError();

    const errors = {};

    // Validate username
    if (!name.trim()) {
      errors.name = 'Name is required';
    } else if (name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    // Strict Email Validation (Rule 1 & 2)
    const emailCheck = validateEmailFormatAndBlocklist(email);
    if (!emailCheck.valid) {
      errors.email = emailCheck.error;
    }

    // Password Validation (Rule 1 & 2)
    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      errors.password = passCheck.error;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    const result = await register({
      name: name.trim(),
      email: email.trim(),
      password
    });
    setLoading(false);

    if (result.success) {
      navigate('/');
    } else {
      const serverErr = result.error || 'Registration failed';
      const serverErrors = result.errors || [];
      const newFieldErrors = {};

      if (
        serverErr === 'Email is invalid' ||
        serverErrors.some(
          (err) => err.field === 'email' || err.message === 'Email is invalid'
        )
      ) {
        newFieldErrors.email = 'Email is invalid';
      } else if (
        serverErr.includes('already exists') ||
        serverErrors.some((err) => err.message?.includes('already exists'))
      ) {
        newFieldErrors.email = 'User with this email address already exists';
      }

      if (
        serverErr === "Your password doesn't contain a letter or number, try adding some" ||
        serverErrors.some((err) =>
          err.message?.includes('letter or number')
        )
      ) {
        newFieldErrors.password =
          "Your password doesn't contain a letter or number, try adding some";
      } else if (
        serverErr === 'Password must be at least 6 characters' ||
        serverErrors.some((err) =>
          err.message?.includes('at least 6 characters')
        )
      ) {
        newFieldErrors.password = 'Password must be at least 6 characters';
      }

      if (Object.keys(newFieldErrors).length > 0) {
        setFieldErrors(newFieldErrors);
      } else {
        setGeneralError(serverErr);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-twitch-card border border-twitch-border rounded-xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded bg-twitch-purple text-white mx-auto flex items-center justify-center shadow-md shadow-twitch-purple/30">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <h1 className="text-xl font-black text-twitch-text tracking-tight pt-2">
            Join StreamPulse today
          </h1>
          <p className="text-xs text-twitch-muted">
            Start streaming live or follow and chat with your favorite creators.
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
          {/* Username Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-twitch-text">
              Username
            </label>
            <input
              type="text"
              placeholder="e.g., CodeNinja"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: null }));
              }}
              className={`w-full bg-[#18181B] border rounded px-3 py-2 text-xs sm:text-sm text-twitch-text placeholder-twitch-muted focus:outline-none transition ${
                fieldErrors.name
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-twitch-border focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple'
              }`}
            />
            {fieldErrors.name && (
              <p className="text-xs text-red-500 font-semibold">{fieldErrors.name}</p>
            )}
          </div>

          {/* Email Address Field */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-twitch-text">
              Email Address
            </label>
            <input
              type="email"
              placeholder="ninja@example.com"
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
              placeholder="At least 6 characters (letters & numbers)"
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-xs text-twitch-muted">
          Already have an account?{' '}
          <Link to="/login" className="text-twitch-purple hover:underline font-bold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};
