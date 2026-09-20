const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zpwsflfzoktwlwixsdut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd3NmbGZ6b2t0d2x3aXhzZHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDE4OTcsImV4cCI6MjEwNTAxNzg5N30.yk-vmXvZuZKslHSZc4_9OvOhAUUOf4-8i2pqk3JcCDs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data: d1, error: e1 } = await supabase.from('tracker_expenses').select('*');
  console.log("tracker_expenses select:", { data: d1, error: e1 });

  const { data: d2, error: e2 } = await supabase.from('expenses').select('*');
  console.log("expenses select:", { data: d2, error: e2 });
}

test();
