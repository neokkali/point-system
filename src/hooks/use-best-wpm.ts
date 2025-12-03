import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";

export const useBestWpm = () => {
  return useQuery({
    queryKey: ["best-wpm"],
    queryFn: async () => {
      const { data } = await api.get("/speed/top-wpm");
      return data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 دقائق
  });
};
