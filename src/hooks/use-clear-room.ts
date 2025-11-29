import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClearRoom(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/room/${roomId}/clear`);
    },
    onSuccess: () => {
      // إعادة جلب قائمة اللاعبين بعد الحذف
      queryClient.invalidateQueries({ queryKey: ["players", roomId] });
    },
    onError: (err) => {
      console.error("خطأ أثناء حذف جميع اللاعبين:", err);
    },
  });
}
