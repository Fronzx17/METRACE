import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';

function validate(email) {
  if (!email) return 'Email wajib diisi.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Format email tidak valid.';
  return '';
}

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { isDark } = useTheme();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate(email.trim());
    if (err) { setEmailError(err); return; }

    setLoading(true);
    setServerError('');

    const { error } = await resetPassword(email.trim());

    setLoading(false);

    if (error) {
      // Don't expose whether email exists — generic message
      if (error.message?.includes('rate limit') || error.status === 429) {
        setServerError('Terlalu banyak permintaan. Tunggu beberapa menit lalu coba lagi.');
      } else {
        // Show success anyway to prevent email enumeration
        setSent(true);
      }
      return;
    }

    setSent(true);
  };

  const cardBg = isDark
    ? 'bg-navy-800/60 border-blue-900/40'
    : 'bg-white border-slate-200 shadow-card-light';

  /* ---- Success state ---- */
  if (sent) {
    return (
      <div className="animate-slide-up text-center">
        <div className="mb-8">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-blue-500/15 border border-blue-500/25">
            <Mail className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Email Terkirim! 📬
          </h1>
          <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Jika akun dengan email{' '}
            <strong className={isDark ? 'text-white' : 'text-slate-800'}>{email}</strong>{' '}
            terdaftar, kami telah mengirimkan tautan reset kata sandi.
          </p>
        </div>

        <div className={`rounded-2xl border p-5 mb-5 ${cardBg}`}>
          <div className="space-y-3 text-left">
            {[
              'Periksa kotak masuk emailmu',
              'Klik tautan "Reset Kata Sandi" dalam email',
              'Buat kata sandi baru yang kuat',
              'Tautan berlaku selama 1 jam',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold
                  ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  {i + 1}
                </div>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => { setSent(false); setEmail(''); }}
            className={`w-full py-3 rounded-xl text-sm font-semibold border transition-colors
              ${isDark
                ? 'border-blue-900/40 text-slate-300 hover:border-blue-500/40 hover:text-white'
                : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'
              }`}
          >
            Kirim Ulang Email
          </button>
          <Link to="/login" className="btn-primary w-full justify-center py-3 block text-center">
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up">
      {/* Back link */}
      <Link
        to="/login"
        className={`inline-flex items-center gap-1.5 text-sm mb-7 transition-colors
          ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800'}`}
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Kembali ke Login
      </Link>

      {/* Header */}
      <div className="mb-7">
        <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/25 flex items-center justify-center mb-5">
          <Mail className="w-6 h-6 text-blue-400" />
        </div>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Lupa Kata Sandi?
        </h1>
        <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Masukkan alamat email akunmu dan kami akan mengirimkan tautan untuk reset kata sandi.
        </p>
      </div>

      <div className={`rounded-2xl border p-6 sm:p-7 ${cardBg}`}>
        {serverError && (
          <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed font-medium">{serverError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Alamat Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="nama@email.com"
              autoComplete="email"
              className={`
                w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 border
                ${isDark
                  ? 'bg-navy-800 border-blue-900/50 text-slate-100 placeholder-slate-600 focus:border-blue-500/70'
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-400'
                }
                ${emailError
                  ? isDark ? 'border-red-500/60' : 'border-red-400'
                  : ''
                }
              `}
            />
            {emailError && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {emailError}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full justify-center py-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim...
              </>
            ) : (
              <>
                Kirim Tautan Reset
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className={`mt-5 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
        Ingat kata sandimu?{' '}
        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
          Masuk sekarang
        </Link>
      </p>
    </div>
  );
}
