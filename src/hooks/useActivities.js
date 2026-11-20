import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

/**
 * useActivities — fetches and manages activities for the current user.
 *
 * DB column mapping (actual Supabase schema):
 *   activity_date  ← what the spec called "date"
 *   duration_minutes ← what the spec called "duration"
 *
 * We normalise rows on fetch so the rest of the app can use:
 *   act.date       → maps to activity_date
 *   act.duration   → maps to duration_minutes
 */
export function useActivities({ limit } = {}) {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /** Normalise a raw DB row to the shape the app expects */
  function normalise(row) {
    if (!row) return row;
    return {
      ...row,
      date: row.activity_date ?? row.date ?? null,
      duration: row.duration_minutes ?? row.duration ?? 0,
    };
  }

  const fetch = useCallback(async () => {
    if (!user) { setActivities([]); setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      let q = supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('activity_date', { ascending: false })
        .order('created_at', { ascending: false });
      if (limit) q = q.limit(limit);
      const { data, error: err } = await q;
      if (err) throw err;
      setActivities((data || []).map(normalise));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => { fetch(); }, [fetch]);

  /* ---- CRUD ---- */

  const addActivity = useCallback(async (fields) => {
    if (!user) return { error: 'Tidak ada sesi.' };
    // Map app fields → DB columns
    const row = {
      title: fields.title,
      category: fields.category,
      duration_minutes: fields.duration,
      activity_date: fields.date,
      notes: fields.notes || null,
      user_id: user.id,
    };
    const { data, error: err } = await supabase.from('activities').insert([row]).select().single();
    if (!err) setActivities((prev) => [normalise(data), ...prev]);
    return { data: normalise(data), error: err };
  }, [user]);

  const updateActivity = useCallback(async (id, fields) => {
    if (!user) return { error: 'Tidak ada sesi.' };
    // Map app fields → DB columns
    const updates = {
      title: fields.title,
      category: fields.category,
      duration_minutes: fields.duration,
      activity_date: fields.date,
      notes: fields.notes || null,
    };
    const { data, error: err } = await supabase
      .from('activities')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    if (!err) setActivities((prev) => prev.map((a) => a.id === id ? normalise(data) : a));
    return { data: normalise(data), error: err };
  }, [user]);

  const deleteActivity = useCallback(async (id) => {
    if (!user) return { error: 'Tidak ada sesi.' };
    const { error: err } = await supabase
      .from('activities')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
    if (!err) setActivities((prev) => prev.filter((a) => a.id !== id));
    return { error: err };
  }, [user]);

  return { activities, loading, error, refetch: fetch, addActivity, updateActivity, deleteActivity };
}
