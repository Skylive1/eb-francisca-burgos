import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuxjcgefwoeyfkjbraur.supabase.co';
const supabaseAnonKey = 'sb_publishable_Suk0bQL6k_1atWIne5Fp4A_E9xtYSiM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStudents() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, id_card')
    .limit(20);

  if (error) {
    console.error('Error fetching students:', error.message);
  } else {
    console.log('--- List of Profiles in DB ---');
    console.table(data);
    const roles = [...new Set(data.map(p => p.role))];
    console.log('Unique roles found:', roles);
  }
}

checkStudents();
