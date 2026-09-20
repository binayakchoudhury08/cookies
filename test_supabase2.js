const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zpwsflfzoktwlwixsdut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd3NmbGZ6b2t0d2x3aXhzZHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDE4OTcsImV4cCI6MjEwNTAxNzg5N30.yk-vmXvZuZKslHSZc4_9OvOhAUUOf4-8i2pqk3JcCDs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('expenses').insert({
    id: "EXP-TEST-3",
    date: "2026-09-20",
    category: "Test",
    title: "Test",
    amount: 100,
    vendor: "Test"
  });
  console.log("expenses insert (omitting fields):", { data, error });
}

test();
