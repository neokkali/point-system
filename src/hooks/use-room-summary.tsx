"use client";

import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";

const useRoomSummary = () => {
  return useQuery({
    queryKey: ["room-summary"],
    queryFn: async () => {
      const { data } = await api.get("/global-scores/global-room-summary");
      return data;
    },
    staleTime: 1000 * 60 * 2,
  });
};

export default useRoomSummary;
