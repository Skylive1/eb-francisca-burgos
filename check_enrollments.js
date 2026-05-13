import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tuxjcgefwoeyfkjbraur.supabase.co';
const supabaseAnonKey = 'sb_publishable_Suk0bQL6k_1atWIne5Fp4A_E9xtYSiM';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEnrollments() {
  const { data, error } = await supabase
    .from('enrollments')
    .select('*')
    .limit(5);

  if (error) {
    console.error('Error fetching enrollments:', error.message);
  } else {
    console.log('--- Sample Enrollments ---');
    console.table(data);
  }
}

checkEnrollments();
