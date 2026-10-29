import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { API_URL, fetchWithTimeout, wakeServer } from '../lib/api';

/**
 * Landing page for email verification links. The link points here (the website is always
 * up) rather than at the API, which sleeps when idle and would show its host's loading page.
 */
const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSlow, setIsSlow] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // Verification tokens are single-use — never send the request twice (e.g. StrictMode)
    if (started.current) return;
    started.current = true;

    const token = searchParams.get('token') || '';
    const slowTimer = setTimeout(() => setIsSlow(true), 4000);
    const finish = (query: string) => {
      clearTimeout(slowTimer);
      navigate(`/login?${query}`, { replace: true });
    };

    if (!token) {
      finish(`verified=error&message=${encodeURIComponent('This verification link is incomplete. Please open it from your email again.')}`);
      return;
    }

    (async () => {
      try {
        await wakeServer();
        const response = await fetchWithTimeout(`${API_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        }, 60000);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data.message || 'Invalid or expired verification link.');
        }
        finish(data.data?.alreadyVerified ? 'verified=already' : 'verified=true');
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Verification failed.';
        finish(`verified=error&message=${encodeURIComponent(message)}`);
      }
    })();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-linear-to-r from-primary-600 to-primary-800 p-3 rounded-2xl shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-5" />
          <h1 className="text-xl font-bold text-secondary-900 mb-2">Verifying your email…</h1>
          <p className="text-sm text-secondary-600">
            {isSlow
              ? 'Connecting to our secure server — this can take up to a minute. Please keep this page open.'
              : 'This only takes a moment.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
