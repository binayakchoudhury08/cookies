const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://zpwsflfzoktwlwixsdut.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpwd3NmbGZ6b2t0d2x3aXhzZHV0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NDE4OTcsImV4cCI6MjEwNTAxNzg5N30.yk-vmXvZuZKslHSZc4_9OvOhAUUOf4-8i2pqk3JcCDs';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function test() {
  const { data, error } = await supabase.from('tracker_expenses').insert({
    id: "EXP-TEST-1",
    date: "2026-09-20",
    category: "Test",
    amount: 100,
    note: "Test note"
  });
  console.log("tracker_expenses insert:", { data, error });

  const { data: d2, error: e2 } = await supabase.from('expenses').insert({
    id: "EXP-TEST-2",
    date: "2026-09-20",
    category: "Test",
    title: "Test",
    amount: 100,
    vendor: "Test",
    payment_method: "Test",
    receipt_no: "Test",
    notes: "Test"
  });
  console.log("expenses insert:", { data: d2, error: e2 });
}

test();
