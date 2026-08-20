import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getAdminSupabaseConfig } from "@/lib/supabase/env";

export function createSupabaseAdminClient() {
  const { url, serviceRoleKey } = getAdminSupabaseConfig();
  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
