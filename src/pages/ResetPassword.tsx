import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, Shield, AlertCircle, KeyRound } from 'lucide-react';
import { API_URL, fetchWithTimeout, wakeServer } from '../lib/api';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Read once: the token is removed from the address bar below
  const [token] = useState(() => searchParams.get('token') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Keep the reset token out of the address bar, history, and third-party scripts on the page
  useEffect(() => {
    if (searchParams.has('token')) {
      navigate('/reset-password', { replace: true });
    }
    void wakeServer();
  }, [navigate, searchParams]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmitError('');

    try {
      await wakeServer();
      const response = await fetchWithTimeout(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Could not reset your password. Please try again.');
      }

      navigate('/login', { replace: true, state: { passwordReset: true } });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const linkExpired = submitError.toLowerCase().includes('invalid or has expired');

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full relative z-10">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-linear-to-r from-primary-600 to-primary-800 p-3 rounded-2xl shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Choose a New Password
          </h1>
          <p className="text-secondary-600">
            Pick a strong password you haven&apos;t used before
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {!token ? (
            <div className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 mb-2">Invalid reset link</h2>
              <p className="text-sm text-secondary-600 mb-6">
                This link is missing or incomplete. Please open the link from your email again, or request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="w-full inline-flex items-center justify-center bg-linear-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Request a new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {/* New Password */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  New Password <span className="text-primary-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock className={`w-5 h-5 transition-colors ${
                      errors.password ? 'text-red-400' : 'text-secondary-400 group-focus-within:text-primary-500'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                    }}
                    className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-secondary-200 hover:border-primary-300'
                    }`}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
                {password && (
                  <div className="mt-2 space-y-1">
                    {[
                      { ok: password.length >= 8, label: 'At least 8 characters' },
                      { ok: /[A-Z]/.test(password), label: 'One uppercase letter' },
                      { ok: /[0-9]/.test(password), label: 'One number' },
                    ].map((rule) => (
                      <div key={rule.label} className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${rule.ok ? 'bg-green-500' : 'bg-secondary-300'}`} />
                        <span className={rule.ok ? 'text-green-600' : 'text-secondary-500'}>{rule.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Confirm New Password <span className="text-primary-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Lock className={`w-5 h-5 transition-colors ${
                      errors.confirmPassword ? 'text-red-400' : 'text-secondary-400 group-focus-within:text-primary-500'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-secondary-200 hover:border-primary-300'
                    }`}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm text-red-600">{submitError}</p>
                    {linkExpired && (
                      <Link
                        to="/forgot-password"
                        className="mt-2 inline-block text-sm font-semibold text-primary-600 hover:text-primary-800 underline"
                      >
                        Request a new link
                      </Link>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-linear-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold transition-all focus:ring-4 focus:ring-primary-200 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating password...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <KeyRound className="w-5 h-5" />
                    <span>Reset Password</span>
                  </div>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
