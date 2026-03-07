import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Delete, HelpCircle, X, Lock } from 'lucide-react';
import { api, getUser, isAuthenticated } from '../lib/api';

const Welcome = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [shake, setShake] = useState(false);
  const [mounted, setMounted] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    // Already verified this session? Go straight to dashboard
    if (sessionStorage.getItem('vaultix_pin_verified') === 'true') {
      navigate('/dashboard');
      return;
    }
    setTimeout(() => setMounted(true), 50);
  }, [navigate]);

  const handleKeyPress = useCallback((digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  }, [pin]);

  const handleClear = useCallback(() => {
    setPin('');
    setError('');
  }, []);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = useCallback(async () => {
    if (pin.length !== 4) {
      setError('Please enter your 4-digit PIN');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      await api('/api/auth/verify-pin', {
        method: 'POST',
        body: { pin },
      });

      sessionStorage.setItem('vaultix_pin_verified', 'true');
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'PIN verification failed';
      setError(message);
      setPin('');
      triggerShake();
    } finally {
      setIsVerifying(false);
    }
  }, [pin, navigate]);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => handleSubmit(), 300);
      return () => clearTimeout(timer);
    }
  }, [pin, handleSubmit]);

  // Physical keyboard support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleKeyPress(e.key);
      else if (e.key === 'Backspace') handleDelete();
      else if (e.key === 'Escape') handleClear();
      else if (e.key === 'Enter' && pin.length === 4) handleSubmit();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleKeyPress, handleDelete, handleClear, handleSubmit, pin]);

  const firstName = user?.fullName?.split(' ')[0] || 'User';

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-800 via-primary-700 to-primary-900 flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-primary-400/10 rounded-full blur-lg" />
      </div>

      <div className={`relative z-10 w-full max-w-sm transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4 border border-white/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome, {firstName}!
          </h1>
          <p className="text-primary-200 text-sm">
            Please enter your 4-digit PIN to continue
          </p>
        </div>

        {/* PIN Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
          {/* PIN Dots */}
          <div className={`flex items-center justify-center gap-4 mb-6 ${shake ? 'animate-shake' : ''}`}>
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  i < pin.length
                    ? 'bg-white scale-110 shadow-lg shadow-white/30'
                    : 'bg-white/20 border-2 border-white/30'
                }`}
              />
            ))}
          </div>

          {/* Lock icon */}
          <div className="flex justify-center mb-4">
            <Lock className={`w-5 h-5 transition-colors ${pin.length === 4 ? 'text-green-400' : 'text-white/40'}`} />
          </div>

          {/* Error */}
          {error && (
            <div className="text-center mb-4">
              <p className="text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Number Pad */}
          <div className="grid grid-cols-3 gap-3">
            {keys.map((key) => {
              if (key === 'clear') {
                return (
                  <button
                    key={key}
                    onClick={handleClear}
                    disabled={isVerifying}
                    className="h-14 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-red-300 font-medium text-sm transition-all active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                  </button>
                );
              }
              if (key === 'delete') {
                return (
                  <button
                    key={key}
                    onClick={handleDelete}
                    disabled={isVerifying}
                    className="h-14 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 transition-all active:scale-95 flex items-center justify-center disabled:opacity-50"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                );
              }
              return (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  disabled={isVerifying || pin.length >= 4}
                  className="h-14 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-xl font-semibold transition-all active:scale-95 disabled:opacity-50"
                >
                  {key}
                </button>
              );
            })}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={pin.length !== 4 || isVerifying}
            className="w-full mt-4 h-12 rounded-xl bg-white text-primary-700 font-bold text-sm transition-all hover:bg-primary-50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Verifying...
              </>
            ) : (
              'Continue to Dashboard'
            )}
          </button>
        </div>

        {/* Help */}
        <div className="text-center mt-6">
          <button className="text-white/40 hover:text-white/70 text-sm flex items-center gap-1.5 mx-auto transition-colors">
            <HelpCircle className="w-4 h-4" />
            Forgot your PIN?
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Welcome;
