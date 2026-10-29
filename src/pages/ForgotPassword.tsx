import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, AlertCircle, ArrowLeft, Send, Check } from 'lucide-react';
import { API_URL, fetchWithTimeout, wakeServer } from '../lib/api';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sentTo, setSentTo] = useState('');

  // Boot the API while the user types
  useEffect(() => {
    void wakeServer();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    if (!/\S+@\S+\.\S+/.test(trimmed)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await wakeServer();
      const response = await fetchWithTimeout(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong. Please try again.');
      }

      setSentTo(trimmed);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

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
            Forgot Your Password?
          </h1>
          <p className="text-secondary-600">
            Enter the email you signed up with and we&apos;ll send you a reset link
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {sentTo ? (
            <div className="p-6 md:p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-secondary-900 mb-2">Check your email</h2>
              <p className="text-sm text-secondary-600 mb-6">
                If an account exists for <span className="font-semibold text-secondary-900 break-all">{sentTo}</span>,
                we&apos;ve sent a link to reset your password. The link expires in 1 hour.
              </p>
              <div className="bg-secondary-50 rounded-xl p-4 text-left text-sm text-secondary-600 mb-6">
                <p className="font-medium text-secondary-700 mb-1">Didn&apos;t get it?</p>
                <p>Check your spam or promotions folder, or wait a minute and try again.</p>
              </div>
              <button
                type="button"
                onClick={() => setSentTo('')}
                className="w-full py-3 px-4 border border-secondary-200 rounded-xl font-medium text-secondary-700 hover:bg-secondary-50 transition-colors mb-3"
              >
                Try a different email
              </button>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center gap-2 bg-linear-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <div className="mb-5">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Email Address <span className="text-primary-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Mail className="w-5 h-5 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                      error ? 'border-red-300 bg-red-50' : 'border-secondary-200 hover:border-primary-300'
                    }`}
                    placeholder="john@example.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
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
                    <span>Sending reset link...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    <span>Send Reset Link</span>
                  </div>
                )}
              </button>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}

          <div className="bg-secondary-50 px-6 py-4 border-t border-secondary-100">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
              <p className="text-xs text-secondary-600">
                For your security, Vaultix will never ask for your password, PIN, or reset link by phone, chat, or email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
