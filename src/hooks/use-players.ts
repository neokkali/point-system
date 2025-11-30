"use client";

import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";

/**
 * جلب اللاعبين لغرفة معينة.
 * @param roomId معرف الغرفة
 */
export function usePlayers(roomId: string) {
  return useQuery({
    queryKey: ["players", roomId], // cache منفصل لكل غرفة
    queryFn: async () => {
      if (!roomId) return [];
      const { data } = await api.get(`/room/${roomId}/players`);
      return data;
    },
    enabled: !!roomId, // تعمل فقط إذا كان roomId موجود
    staleTime: 1000 * 60 * 5, // 5 دقائق
  });
}
