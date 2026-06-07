import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { env, hasSupabaseEnv } from "@/config/env";
import { supabaseClientOptions } from "@/services/supabase/options";

export async function createSupabaseServerClient() {
  if (!hasSupabaseEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    ...supabaseClientOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });
}
