// hooks/use-players.ts
"use client";

import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";

export function usePlayers(roomId: string) {
  return useQuery({
    queryKey: ["players", roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const { data } = await api.get(`/room/${roomId}/players`);
      return data;
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 5,
  });
}
