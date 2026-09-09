import React, { useState } from 'react';
import { login } from '../api';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('admin@creditrisk.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      onLoginSuccess();
    } catch (err: any) {
      const msg =
        err?.response?.status === 401
          ? 'Invalid credentials. Try the demo accounts below.'
          : err?.response?.data?.message || 'Login failed — backend unreachable. You can still explore in demo mode.';
      setError(msg);
      // Allow demo exploration when backend is down
      if (err?.response?.status !== 401 && String(err?.message || '').includes('Network Error')) {
        localStorage.setItem('creditrisk_token', `demo-${Date.now()}`);
        localStorage.setItem('creditrisk_user', JSON.stringify({ token: `demo-${Date.now()}`, email, role: 'ADMIN' }));
        onLoginSuccess();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-8 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded bg-black flex items-center justify-center text-white shrink-0">
              <span className="material-symbols-outlined">monitoring</span>
            </div>
            <div>
              <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">CreditRisk AI</h1>
              <p className="text-[12px] text-[#76777d]">Enterprise Decisioning Platform</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Work Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-3 py-2 text-[13px] text-[#0b1c30] focus:bg-white focus:border-black focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-[#76777d] uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-[#c6c6cd] rounded px-3 py-2 text-[13px] text-[#0b1c30] focus:bg-white focus:border-black focus:outline-none"
              />
            </div>

            {error && (
              <div className="text-[12px] bg-red-50 border border-red-200 text-red-800 rounded px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full px-5 py-2.5 bg-black text-white text-[13px] font-semibold rounded hover:bg-black/85 disabled:opacity-50 cursor-pointer"
            >
              {busy ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#e2e8f0] text-[12px] text-[#76777d] space-y-1">
            <p className="font-bold text-[#45464d] uppercase tracking-wider text-[11px]">Demo accounts</p>
            <p>admin@creditrisk.com · password</p>
            <p>analyst@creditrisk.com · password</p>
          </div>
        </div>
        <p className="text-center text-[11px] text-[#76777d] mt-4">
          Educational simulation — not for real credit underwriting.
        </p>
      </div>
    </div>
  );
};
