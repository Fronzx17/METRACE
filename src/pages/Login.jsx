import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Zap, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

/* ---- Reusable input field ---- */
function AuthInput({ id, label, type = 'text', value, onChange, error, placeholder, autoComplete, suffix }) {
  const { isDark } = useTheme();
  return (
    <div>
      <label htmlFor={id} className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border
            ${suffix ? 'pr-11' : ''}
            ${isDark
              ? 'bg-navy-800 border-blue-900/50 text-slate-100 placeholder-slate-600 focus:border-blue-500/70 focus:bg-navy-700/50'
              : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400 focus:shadow-sm'
            }
            ${error
              ? isDark ? 'border-red-500/60 focus:border-red-500/80' : 'border-red-400 focus:border-red-500'
              : ''
            }
          `}
        />
        {suffix && (
          <div className="absolute right-0 top-0 h-full flex items-center pr-3">
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ---- Validation helpers ---- */
function validate({ email, password }) {
  const errors = {};
  if (!email) errors.email = 'Email wajib diisi.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid.';
  if (!password) errors.password = 'Kata sandi wajib diisi.';
  return errors;
}

export default function Login() {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const setField = (field) => (e) => {
    setForm((p) => ({ ...p, [field]: e.target.value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');

    const { error } = await login({ email: form.email.trim(), password: form.password });

    if (error) {
      // Map Supabase error codes to user-friendly Indonesian messages
      if (error.message?.includes('Invalid login credentials')) {
        setServerError('Email atau kata sandi salah. Silakan periksa kembali.');
      } else if (error.message?.includes('Email not confirmed')) {
        setServerError('Email kamu belum dikonfirmasi. Periksa kotak masuk emailmu.');
      } else if (error.message?.includes('Too many requests')) {
        setServerError('Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.');
      } else {
        setServerError('Terjadi kesalahan. Silakan coba lagi.');
      }
      setLoading(false);
      return;
    }

    // onAuthStateChange in AuthContext handles the state update
    navigate(from, { replace: true });
  };

  const cardBg = isDark
    ? 'bg-navy-800/60 border-blue-900/40'
    : 'bg-white border-slate-200 shadow-card-light';

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gradient">METRACE</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Selamat datang kembali 👋
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Masuk ke akun METRACE kamu untuk melanjutkan.
        </p>
      </div>

      {/* Form card */}
      <div className={`rounded-2xl border p-6 sm:p-7 ${cardBg}`}>
        {/* Server error */}
        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthInput
            id="email"
            label="Alamat Email"
            type="email"
            value={form.email}
            onChange={setField('email')}
            error={errors.email}
            placeholder="nama@email.com"
            autoComplete="email"
          />

          <AuthInput
            id="password"
            label="Kata Sandi"
            type={showPass ? 'text' : 'password'}
            value={form.password}
            onChange={setField('password')}
            error={errors.password}
            placeholder="Kata sandi kamu"
            autoComplete="current-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowPass((p) => !p)}
                className={`transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label={showPass ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          {/* Forgot password link */}
          <div className="flex justify-end -mt-1">
            <Link
              to="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Lupa kata sandi?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Masuk
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Register link */}
      <p className={`mt-5 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        Belum punya akun?{' '}
        <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
