import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { Zap } from 'lucide-react';

/**
 * ProtectedRoute — only accessible when authenticated.
 * Renders children OR <Outlet /> (works for both wrapper and layout patterns).
 * Redirects unauthenticated users to /login,
 * preserving the intended destination via state.from.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoadingScreen />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If children is provided (e.g. wrapping <AppLayout />), render it.
  // Otherwise render <Outlet /> for nested route usage.
  return children ?? <Outlet />;
}

/**
 * PublicRoute — only accessible when NOT authenticated.
 * Redirects authenticated users to /dashboard (or their intended destination).
 */
export function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  if (loading) return <AuthLoadingScreen />;

  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  return children ?? <Outlet />;
}

/**
 * Full-screen loading screen shown while checking session state.
 */
function AuthLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center dark:bg-navy-950 bg-slate-50 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow-blue animate-pulse">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-500"
              style={{ animation: `bounce 1s infinite ${i * 0.15}s` }}
            />
          ))}
        </div>
        <p className="text-sm text-slate-500 font-medium">Memuat sesi...</p>
      </div>
    </div>
  );
}
