import { createClient } from "@supabase/supabase-js";

// Use placeholders during build phase if environment variables are not yet injected
const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder-url-for-build.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key-for-build";

if (!process.env.SUPABASE_URL || (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)) {
  console.warn("Supabase credentials missing in environment! Using placeholder for build safety.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

