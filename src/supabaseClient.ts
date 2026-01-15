import { createClient } from '@supabase/supabase-js';

// TODO: Inserta tu ANON KEY aquí
const supabaseUrl = 'https://yjyptkurssqlxiguqlfb.supabase.co';
const supabaseAnonKey = 'TU_ANON_KEY_AQUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
