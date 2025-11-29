import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdatePlayers(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (players: { username: string; points: number }[]) => {
      await api.post(`/room/${roomId}/players`, { players });
    },
    onSuccess: () => {
      // تحديث البيانات في cache بدون refetch كامل
      queryClient.invalidateQueries({
        queryKey: ["players", roomId],
      });
    },
  });
}
