// hooks/useCurrentUser.ts
"use client";

import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data.user ?? null;
    },
    retry: false, // لا تكرر لأن 401 طبيعي عند عدم تسجيل الدخول
    staleTime: 60 * 1000, // دقيقة كاملة كاش
  });
}
