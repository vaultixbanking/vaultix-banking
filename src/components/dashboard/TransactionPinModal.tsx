import { useState, useEffect, useCallback } from 'react';
import { Shield, Delete, X, Lock, Loader2, AlertCircle } from 'lucide-react';

interface TransactionPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (pin: string) => Promise<void>;
  title?: string;
  subtitle?: string;
}

const TransactionPinModal = ({
  isOpen,
  onClose,
  onSubmit,
  title = 'Confirm Transaction',
  subtitle = 'Enter your 4-digit transaction PIN to proceed',
}: TransactionPinModalProps) => {
  const [pin, setPin]           = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [shake, setShake]       = useState(false);
  const [visible, setVisible]   = useState(false);

  // Animate in/out
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
      setTimeout(() => {
        setPin('');
        setError('');
        setLoading(false);
      }, 300);
    }
  }, [isOpen]);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleKeyPress = useCallback((digit: string) => {
    if (loading) return;
    if (pin.length < 4) {
      setPin(prev => prev + digit);
      setError('');
    }
  }, [pin, loading]);

  const handleDelete = useCallback(() => {
    if (loading) return;
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, [loading]);

  const handleClear = useCallback(() => {
    if (loading) return;
    setPin('');
    setError('');
  }, [loading]);

  const handleSubmit = useCallback(async () => {
    if (pin.length !== 4 || loading) return;
    setLoading(true);
    setError('');
    try {
      await onSubmit(pin);
      // Parent handles success — modal will be closed by parent
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Incorrect PIN. Try again.';
      setError(msg);
      setPin('');
      triggerShake();
    } finally {
      setLoading(false);
    }
  }, [pin, loading, onSubmit]);

  // Auto-submit when 4 digits entered
  useEffect(() => {
    if (pin.length === 4) {
      const t = setTimeout(() => handleSubmit(), 300);
      return () => clearTimeout(t);
    }
  }, [pin, handleSubmit]);

  // Keyboard support
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleKeyPress(e.key);
      else if (e.key === 'Backspace') handleDelete();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, handleKeyPress, handleDelete, onClose]);

  if (!isOpen) return null;

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'delete'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative z-10 w-full max-w-sm transition-all duration-300 ${
          visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        }`}
      >
        {/* Card */}
        <div className="bg-linear-to-br from-primary-800 via-primary-700 to-primary-900 rounded-3xl p-6 border border-white/20 shadow-2xl relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20" />
          </div>

          <div className="relative z-10">
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={loading}
              className="absolute top-0 right-0 p-1.5 rounded-xl text-white/40 hover:text-white/80 hover:bg-white/10 transition-all disabled:opacity-30"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl mb-3 border border-white/20">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">{title}</h3>
              <p className="text-primary-200 text-xs mt-1">{subtitle}</p>
            </div>

            {/* PIN Dots */}
            <div className={`flex items-center justify-center gap-4 mb-4 ${shake ? 'animate-shake' : ''}`}>
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={`w-3.5 h-3.5 rounded-full transition-all duration-200 ${
                    i < pin.length
                      ? 'bg-white scale-110 shadow-lg shadow-white/30'
                      : 'bg-white/20 border-2 border-white/30'
                  }`}
                />
              ))}
            </div>

            {/* Lock icon */}
            <div className="flex justify-center mb-3">
              <Lock className={`w-4 h-4 transition-colors ${pin.length === 4 ? 'text-green-400' : 'text-white/30'}`} />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-red-500/20 border border-red-400/30 rounded-xl">
                <AlertCircle className="w-3.5 h-3.5 text-red-300 shrink-0" />
                <p className="text-red-200 text-xs">{error}</p>
              </div>
            )}

            {/* Numpad */}
            <div className="grid grid-cols-3 gap-2.5">
              {keys.map(key => {
                if (key === 'clear') {
                  return (
                    <button
                      key={key}
                      onClick={handleClear}
                      disabled={loading}
                      className="h-12 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-red-300 text-xs font-medium transition-all active:scale-95 flex items-center justify-center disabled:opacity-40"
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
                      disabled={loading}
                      className="h-12 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 transition-all active:scale-95 flex items-center justify-center disabled:opacity-40"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  );
                }
                return (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    disabled={loading || pin.length >= 4}
                    className="h-12 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white text-lg font-semibold transition-all active:scale-95 disabled:opacity-40"
                  >
                    {key}
                  </button>
                );
              })}
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleSubmit}
              disabled={pin.length !== 4 || loading}
              className="w-full mt-4 h-11 rounded-xl bg-white text-primary-700 font-bold text-sm transition-all hover:bg-primary-50 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Confirm Transaction'
              )}
            </button>
          </div>
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

export default TransactionPinModal;