import { supabase } from '../../supabaseClient';

export async function uploadProfilePhoto(userId: string, file: File) {
  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/avatar.${fileExt}`;
  let { error } = await supabase.storage.from('user-photos').upload(filePath, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('user-photos').getPublicUrl(filePath);
  return data.publicUrl;
}

export async function upsertUserProfile(profile: {
  id: string,
  nombre: string,
  fecha_nacimiento: string,
  telefono: string,
  ciudad: string,
  barrio: string,
  photo_url: string,
  email: string
}) {
  const { data, error } = await supabase.from('user_profiles').upsert([profile], { onConflict: 'id' });
  return { data, error };
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase.from('user_profiles').select('*').eq('id', userId).single();
  return { data, error };
}
