import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * DemoBanner — clearly labels demo data to the user
 */
export default function DemoBanner({ message = 'Data berikut adalah contoh demonstrasi, bukan data aktivitasmu yang sesungguhnya.' }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400">
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <p className="text-xs leading-relaxed font-medium">{message}</p>
    </div>
  );
}
