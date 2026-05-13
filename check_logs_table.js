import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuxjcgefwoeyfkjbraur.supabase.co';
const supabaseAnonKey = 'sb_publishable_Suk0bQL6k_1atWIne5Fp4A_E9xtYSiM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable() {
  const { data, error } = await supabase
    .from('qr_access_logs')
    .select('*')
    .limit(1);

  if (error) {
    console.log('Error or table does not exist:', error.message);
  } else {
    console.log('Table exists. Sample data:', data);
  }
}

checkTable();
