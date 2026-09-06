import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { HeartPulse, Stethoscope, UserCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const doLogin = async (ph?: string, pw?: string) => {
    setError(''); setLoading(true);
    let loginPhone = (ph || phone).trim().replace(/[\s-]/g, '');
    if (loginPhone.length === 10 && !loginPhone.startsWith('+')) {
      loginPhone = '+91' + loginPhone;
    } else if (loginPhone.startsWith('91') && loginPhone.length === 12) {
      loginPhone = '+' + loginPhone;
    }
    const loginPass = (pw || password).trim();
    try {
      const { data } = await api.post('/auth/login', { phone: loginPhone, password: loginPass });
      localStorage.setItem('ayusync_token', data.token);
      localStorage.setItem('ayusync_user', JSON.stringify(data.user));
      navigate(data.user.role === 'WORKER' ? '/worker' : '/dashboard');
    } catch (e: any) {
      const serverMsg = e.response?.data?.message || e.response?.data?.error;
      setError(serverMsg || (e.message ? `${e.message} - please check backend connection` : 'Could not sign in. Please check your credentials.'));
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f7f3]" style={{ animation: 'login-page-in 0.5s cubic-bezier(0.4,0,0.2,1) both' }}>
      {/* Left panel — brand (hidden on small screens) */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-[#1e6641] p-10 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="relative z-10">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <HeartPulse size={22} className="text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">SwasthyaSetu</div>
              <div className="text-white/50 text-xs">By Team Sanjeevani</div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white leading-snug mb-3">
            Community healthcare,<br />everywhere it matters.
          </h2>
          <p className="text-white/60 text-sm leading-relaxed">
            Connecting ASHA health workers and doctors across rural India — so no patient slips through the cracks.
          </p>
        </div>
        <div className="relative z-10">
          <div className="text-white/40 text-xs">SIH 2026 · Rural Healthcare Platform</div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-[#1e6641] text-white flex items-center justify-center">
              <HeartPulse size={17} />
            </div>
            <div className="text-sm font-bold text-gray-900">SwasthyaSetu</div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome</h1>
          <p className="text-sm text-gray-500 mb-7">Let’s get started with your healthcare journey.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={e => { e.preventDefault(); doLogin(); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone number</label>
              <input
                type="text" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+919876543210"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1e6641] focus:outline-none bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm text-gray-900 focus:ring-2 focus:ring-[#1e6641] focus:outline-none bg-white"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e6641] hover:bg-[#165032] text-white font-semibold text-sm transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>

          {/* Quick demo access */}
          <div className="mt-7 pt-6 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide ">Demo Access</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPhone('+919876543210');
                  setPassword('password123');
                  doLogin('+919876543210', 'password123');
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-[#1e6641]/40 hover:bg-[#e4efe7]/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#1e6641] text-white flex items-center justify-center shrink-0">
                  <Stethoscope size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-[#1e6641]">Doctor login</div>
                  <div className="text-[11px] text-gray-400">Dr. Sharma</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhone('+919998887776');
                  setPassword('password123');
                  doLogin('+919998887776', 'password123');
                }}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 hover:border-[#1e6641]/40 hover:bg-[#e4efe7]/50 transition-all text-left group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#5e7a3e] text-white flex items-center justify-center shrink-0">
                  <UserCheck size={15} />
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-900 group-hover:text-[#1e6641]">Health worker login</div>
                  <div className="text-[11px] text-gray-400">Sunita Devi</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
