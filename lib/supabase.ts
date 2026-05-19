import { createClient } from "@supabase/supabase-js";

// Supabase is optional — if env vars are missing, all functions are no-ops
function getClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) return null;

  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const supabase = getClient();
  if (!supabase) return false;

  const { data, error } = await supabase
    .from("submissions")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (error) return false;
  return !!data;
}

export async function saveSubmission(
  email: string,
  answers: string[],
  analysis: string
): Promise<void> {
  const supabase = getClient();
  if (!supabase) return;

  await supabase.from("submissions").upsert(
    { email, answers, analysis, created_at: new Date().toISOString() },
    { onConflict: "email" }
  );
}
