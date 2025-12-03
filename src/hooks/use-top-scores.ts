import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";

type GlobalScore = {
  id: string;
  userId: string;
  wpm: number;
  totalScore: number;
  user: {
    username: string;
  };
};

export const useTopScores = () => {
  return useQuery<GlobalScore[]>({
    queryKey: ["top-scores"],
    queryFn: async () => {
      const res = await api.get("/speed");
      return res.data.topScores;
    },
    staleTime: 1000 * 60, // دقيقة واحدة قبل إعادة الجلب
  });
};
