import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey  = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── APPARTEMENTS ──────────────────────────────────────────────────────
export const getAppartements = async () => {
  const { data, error } = await supabase
    .from('appartements')
    .select('*, proprios(*), equipes(*)')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
};

export const createAppartement = async (appart) => {
  const { data, error } = await supabase
    .from('appartements')
    .insert(appart)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateAppartement = async (id, updates) => {
  const { data, error } = await supabase
    .from('appartements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── RÉSERVATIONS ──────────────────────────────────────────────────────
export const getReservations = async (appart_id = null) => {
  let query = supabase
    .from('reservations')
    .select('*, appartements(nom, nom_long, color)')
    .order('checkin', { ascending: true });
  if (appart_id) query = query.eq('appart_id', appart_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const createReservation = async (reservation) => {
  const { data, error } = await supabase
    .from('reservations')
    .insert(reservation)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateReservation = async (id, updates) => {
  const { data, error } = await supabase
    .from('reservations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── MISSIONS MÉNAGE ───────────────────────────────────────────────────
export const getMissions = async (equipe_id = null) => {
  let query = supabase
    .from('missions_menage')
    .select('*, appartements(nom, nom_long), equipes(nom)')
    .order('date', { ascending: true });
  if (equipe_id) query = query.eq('equipe_id', equipe_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const updateMission = async (id, updates) => {
  const { data, error } = await supabase
    .from('missions_menage')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── UPLOAD MÉDIA MÉNAGE ───────────────────────────────────────────────
export const uploadMedia = async (mission_id, file, type) => {
  const timestamp = new Date().toISOString();
  const filename  = `${mission_id}/${timestamp}_${type}.${type === 'video' ? 'webm' : 'jpg'}`;
  const { error: uploadError } = await supabase.storage
    .from('medias-menage')
    .upload(filename, file, { contentType: type === 'video' ? 'video/webm' : 'image/jpeg' });
  if (uploadError) throw uploadError;
  const { data, error } = await supabase
    .from('medias_menage')
    .insert({ mission_id, url: filename, type, stamp: timestamp })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getMediaUrl = (path) => {
  const { data } = supabase.storage
    .from('medias-menage')
    .createSignedUrl(path, 3600);
  return data?.signedUrl;
};

// ── MESSAGES ──────────────────────────────────────────────────────────
export const getMessages = async (appart_id = null) => {
  let query = supabase
    .from('messages')
    .select('*, appartements(nom)')
    .order('date', { ascending: false });
  if (appart_id) query = query.eq('appart_id', appart_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const sendMessage = async (message) => {
  const { data, error } = await supabase
    .from('messages')
    .insert(message)
    .select()
    .single();
  if (error) throw error;
  return data;
};

// ── AVIS ──────────────────────────────────────────────────────────────
export const getAvis = async (appart_id = null) => {
  let query = supabase
    .from('avis')
    .select('*, reservations(voyageur_nom, checkin, checkout)')
    .order('created_at', { ascending: false });
  if (appart_id) query = query.eq('appart_id', appart_id);
  const { data, error } = await query;
  if (error) throw error;
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────────────
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    // Recherche par id (pas par email) — plus robuste
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    return { ...user, profile: profile || { role: 'admin' } };
  } catch (e) {
    console.error('getCurrentUser error:', e);
    return null;
  }
};

export const getUserRole = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    return data?.role || 'admin';
  } catch (e) {
    return 'admin';
  }
};

// ── PROPRIOS ──────────────────────────────────────────────────────────
export const getProprios = async () => {
  const { data, error } = await supabase
    .from('proprios')
    .select('*')
    .order('nom');
  if (error) throw error;
  return data;
};

// ── ÉQUIPES ───────────────────────────────────────────────────────────
export const getEquipes = async () => {
  const { data, error } = await supabase
    .from('equipes')
    .select('*')
    .order('nom');
  if (error) throw error;
  return data;
};

// ── AUTH ──────────────────────────────────────────────────────────────
export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};
