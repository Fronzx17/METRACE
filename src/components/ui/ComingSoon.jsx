import React from 'react';
import { Construction } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

/**
 * ComingSoon — placeholder for pages not yet implemented
 */
export default function ComingSoon({ feature, description, icon: Icon = Construction }) {
  const { isDark } = useTheme();

  return (
    <div className={`
      flex flex-col items-center justify-center text-center
      py-16 px-6 rounded-2xl border
      ${isDark ? 'bg-navy-800 border-blue-900/40' : 'bg-white border-slate-200'}
    `}>
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-blue-500/20 flex items-center justify-center mb-5">
        <Icon className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {feature || 'Segera Hadir'}
      </h3>
      <p className={`text-sm max-w-md leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {description || 'Fitur ini sedang dalam pengembangan dan akan segera tersedia. Kami terus bekerja untuk menghadirkan pengalaman terbaik untukmu.'}
      </p>
      <div className="mt-6 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <p className="text-xs text-blue-400 font-medium">Fase Pengembangan Berikutnya</p>
      </div>
    </div>
  );
}
