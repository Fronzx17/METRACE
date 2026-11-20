import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, Zap, AlertCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

/* ---- Reusable input ---- */
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

/* ---- Password strength indicator ---- */
function PasswordStrength({ password }) {
  const { isDark } = useTheme();
  if (!password) return null;

  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const labels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
  const colors = ['bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-500'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`flex-1 h-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score] : isDark ? 'bg-navy-700' : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
        Kekuatan: <span className="font-semibold">{labels[score]}</span>
      </p>
    </div>
  );
}

/* ---- Validation ---- */
function validate({ fullName, email, password, confirmPassword }) {
  const errors = {};
  if (!fullName.trim()) errors.fullName = 'Nama lengkap wajib diisi.';
  else if (fullName.trim().length < 2) errors.fullName = 'Nama terlalu pendek.';

  if (!email) errors.email = 'Email wajib diisi.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Format email tidak valid.';

  if (!password) errors.password = 'Kata sandi wajib diisi.';
  else if (password.length < 8) errors.password = 'Kata sandi minimal 8 karakter.';

  if (!confirmPassword) errors.confirmPassword = 'Konfirmasi kata sandi wajib diisi.';
  else if (password !== confirmPassword) errors.confirmPassword = 'Kata sandi tidak cocok.';

  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);

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

    const { data, error } = await register({
      email: form.email.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
    });

    if (error) {
      if (error.message?.includes('User already registered') || error.message?.includes('already been registered')) {
        setServerError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.');
      } else if (error.message?.includes('Password should be')) {
        setServerError('Kata sandi terlalu lemah. Gunakan kombinasi huruf, angka, dan simbol.');
      } else if (error.message?.includes('rate limit')) {
        setServerError('Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.');
      } else {
        setServerError('Terjadi kesalahan saat mendaftar. Silakan coba lagi.');
      }
      setLoading(false);
      return;
    }

    setLoading(false);

    // Check if email confirmation is required
    if (data?.user && !data?.session) {
      // Email confirmation required — show success message
      setSuccess(true);
    } else if (data?.session) {
      // Auto-confirmed — navigate to dashboard
      navigate('/dashboard', { replace: true });
    } else {
      setSuccess(true);
    }
  };

  const cardBg = isDark
    ? 'bg-navy-800/60 border-blue-900/40'
    : 'bg-white border-slate-200 shadow-card-light';

  /* ---- Success state ---- */
  if (success) {
    return (
      <div className="animate-slide-up text-center">
        <div className="mb-8">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-emerald-500/15 border border-emerald-500/25`}>
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Pendaftaran Berhasil! 🎉
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Kami telah mengirim email konfirmasi ke{' '}
            <strong className={isDark ? 'text-white' : 'text-slate-800'}>{form.email}</strong>.
            <br />
            Periksa kotak masuk emailmu dan klik tautan konfirmasi untuk mengaktifkan akunmu.
          </p>
        </div>
        <div className={`rounded-2xl border p-5 ${cardBg} mb-5`}>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            💡 Tidak menemukan email? Periksa folder <strong>Spam</strong> atau <strong>Promosi</strong>.
            Tautan konfirmasi berlaku selama 24 jam.
          </p>
        </div>
        <Link
          to="/login"
          className="btn-primary w-full justify-center py-3"
        >
          Lanjut ke Halaman Masuk
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="mb-7">
        <div className="flex items-center gap-2 mb-5 lg:hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-gradient">METRACE</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Buat akun baru ✨
        </h1>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Mulai perjalanan analitik waktumu bersama METRACE.
        </p>
      </div>

      {/* Form card */}
      <div className={`rounded-2xl border p-6 sm:p-7 ${cardBg}`}>
        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthInput
            id="fullName"
            label="Nama Lengkap"
            type="text"
            value={form.fullName}
            onChange={setField('fullName')}
            error={errors.fullName}
            placeholder="Nama lengkapmu"
            autoComplete="name"
          />

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

          <div>
            <AuthInput
              id="password"
              label="Kata Sandi"
              type={showPass ? 'text' : 'password'}
              value={form.password}
              onChange={setField('password')}
              error={errors.password}
              placeholder="Minimal 8 karakter"
              autoComplete="new-password"
              suffix={
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className={`transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                  aria-label={showPass ? 'Sembunyikan' : 'Tampilkan'}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />
            <PasswordStrength password={form.password} />
          </div>

          <AuthInput
            id="confirmPassword"
            label="Konfirmasi Kata Sandi"
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={setField('confirmPassword')}
            error={errors.confirmPassword}
            placeholder="Ulangi kata sandimu"
            autoComplete="new-password"
            suffix={
              <button
                type="button"
                onClick={() => setShowConfirm((p) => !p)}
                className={`transition-colors ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-600'}`}
                aria-label={showConfirm ? 'Sembunyikan' : 'Tampilkan'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mendaftarkan...
              </>
            ) : (
              <>
                Buat Akun
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Terms note */}
        <p className={`text-[11px] mt-4 text-center leading-relaxed ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
          Dengan mendaftar, kamu menyetujui ketentuan penggunaan METRACE.
        </p>
      </div>

      {/* Login link */}
      <p className={`mt-5 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        Sudah punya akun?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
