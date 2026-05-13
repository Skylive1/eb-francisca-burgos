
import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://TU_URL.supabase.co', 'TU_KEY');

async function checkColumns() {
  const { data, error } = await supabase.from('vlog_pills').select('*').limit(1);
  if (error) {
    console.error('Error fetching data:', error.message);
  } else {
    console.log('Columns in vlog_pills:', Object.keys(data[0] || {}));
  }
}

// Since I can't easily get the env vars in the script without more setup, 
// I'll try to use the ones from the project if possible, but actually 
// I'll just check the error message from Supabase when I try to insert into a non-existent column.
