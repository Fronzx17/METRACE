import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---- Fetch profile ---- */
  const fetchProfile = useCallback(async (userId) => {
    if (!userId) { setProfile(null); return; }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, created_at')
        .eq('id', userId)
        .single();
      if (error) {
        console.warn('[METRACE] Profile fetch warning:', error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error('[METRACE] Profile fetch error:', err);
      setProfile(null);
    }
  }, []);

  /* ---- Bootstrap: check session on mount ---- */
  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        // getSession reads from localStorage — always try this first
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[METRACE] getSession error:', sessionError.message);
        }

        if (!mounted) return;

        if (session?.user) {
          console.log('[METRACE] Session found for user:', session.user.email);
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          console.log('[METRACE] No session found');
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.error('[METRACE] Bootstrap error:', err);
        if (mounted) { setUser(null); setProfile(null); }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    bootstrap();

    /* ---- Auth state listener ---- */
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        console.log('[METRACE] Auth event:', event, session?.user?.email);

        if (session?.user) {
          setUser(session.user);
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            fetchProfile(session.user.id);
          }
        } else {
          setUser(null);
          setProfile(null);
        }

        // Always clear loading after first auth event
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  /* ---- Auth actions ---- */

  const register = useCallback(async ({ email, password, fullName }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    return { data, error };
  }, []);

  const login = useCallback(async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error && data?.user) {
      console.log('[METRACE] Login success:', data.user.email);
      setUser(data.user);
      fetchProfile(data.user.id);
    }
    return { data, error };
  }, [fetchProfile]);

  const resetPassword = useCallback(async (email) => {
    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    return { error };
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (fields) => {
    if (!user) return { error: { message: 'Tidak ada sesi aktif.' } };
    const { error } = await supabase
      .from('profiles')
      .update({ ...fields })
      .eq('id', user.id);
    if (!error) setProfile((prev) => prev ? { ...prev, ...fields } : prev);
    return { error };
  }, [user]);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    resetPassword,
    updateProfile,
    refetchProfile: () => fetchProfile(user?.id),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
