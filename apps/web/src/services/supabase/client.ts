import { createBrowserClient } from "@supabase/ssr";
import { env, hasSupabaseEnv } from "@/config/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

export function createSupabaseClient() {
  if (!hasSupabaseEnv) {
    return null;
  }

  if (browserClient) {
    return browserClient;
  }

  browserClient = createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  return browserClient;
}
