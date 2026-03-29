import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zommwnzejbuaefiprfyf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbW13bnplamJ1YWVmaXByZnlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTk5MTEsImV4cCI6MjA5MDE5NTkxMX0.OH3zpGF0pzrEz4BQFo7FKqgwLQT9F5dW2KMBt6IuV0s'
);

async function test() {
  const { data, error } = await supabase.from('patients').select('*').limit(1);
  console.log('Error:', error);
  console.log('Data:', data);
}

test();
