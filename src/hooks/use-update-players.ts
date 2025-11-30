import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePlayers(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      players: { id?: string; username: string; points: number }[]
    ) => {
      await api.post(`/room/${roomId}/players`, { players });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players", roomId] });
    },
    onError: (err) => console.error("خطأ أثناء تحديث اللاعبين:", err),
  });
}
