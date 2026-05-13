import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados en el backend/.env');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function ensureSchema() {
  // Note: Schema creation should be done manually in Supabase dashboard
  // This function is kept for compatibility but doesn't create tables
  console.log('Schema should be created manually in Supabase');
}
