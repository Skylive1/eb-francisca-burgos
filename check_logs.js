import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuxjcgefwoeyfkjbraur.supabase.co';
const supabaseAnonKey = 'sb_publishable_Suk0bQL6k_1atWIne5Fp4A_E9xtYSiM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkLogs() {
  const { data, error } = await supabase
    .from('qr_access_logs')
    .select('*')
    .limit(10);

  if (error) {
    console.error('Error fetching logs:', error.message);
  } else {
    console.log('--- Access Logs ---');
    console.table(data);
  }
}

checkLogs();
