"use client";

import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";

export function useGlobalScores() {
  return useQuery({
    queryKey: ["global-scores"],
    queryFn: async () => {
      const { data } = await api.get("/global-scores");
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
}
