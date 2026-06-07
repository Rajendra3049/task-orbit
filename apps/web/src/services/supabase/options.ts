import { supabaseFetch } from "@/services/supabase/fetch";

export const supabaseClientOptions = {
  global: {
    fetch: supabaseFetch,
  },
};
