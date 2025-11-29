import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeletePlayer(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (playerId: string) => {
      await api.delete(`/room/${roomId}/players/${playerId}`);
    },
    onSuccess: () => {
      // إعادة جلب اللاعبين للغرفة بعد الحذف
      queryClient.invalidateQueries({ queryKey: ["players", roomId] });
    },
    onError: (err) => {
      console.error("خطأ أثناء الحذف:", err);
    },
  });
}
