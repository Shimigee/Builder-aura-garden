import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://xeixiofcmamvlkyikenh.supabase.co";
const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXhpb2ZjbWFtdmxreWlrZW5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMzYwMzUsImV4cCI6MjA2NjkxMjAzNX0.re4UOKgn5vnhEXhgoUWilSX0r9zw5nXvafkBkfHhnPo";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
