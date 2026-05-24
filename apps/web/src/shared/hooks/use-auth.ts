"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createSupabaseClient } from "@/services/supabase/client";

const AUTH_QUERY_KEY = ["auth", "user"] as const;

export function useAuthUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const supabase = createSupabaseClient();
      if (!supabase) {
        return null;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      return user;
    },
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const supabase = createSupabaseClient();
      if (!supabase) {
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
    },
  });
}
