import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdatePlayers(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      players: { id?: string; username: string; points: number }[]
    ) => {
      await api.post(`/room/${roomId}/players`, { players });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["players", "global-scores", roomId],
      });
      toast.success("تم تحديث قائمة اللاعبين بنجاح");
    },
    onError: (err) => console.error("خطأ أثناء تحديث اللاعبين:", err),
  });
}
