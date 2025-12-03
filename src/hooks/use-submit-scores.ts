import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ScorePayload {
  wpm: number;
}

export const useSubmitScore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ScorePayload) => {
      const response = await api.post("/speed", data);
      return response.data; // يتضمن الـ topScores بعد التحديث
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["top-scores"] });
    },
  });
};
