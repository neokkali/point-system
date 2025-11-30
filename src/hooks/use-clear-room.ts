import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useClearRoom(roomId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/room/${roomId}/clear`);
    },
    onSuccess: () => {
      // إعادة جلب قائمة اللاعبين بعد الحذف
      queryClient.invalidateQueries({ queryKey: ["players", roomId] });
      toast.success("تم مسح جميع اللاعبين بنجاح");
    },
    onError: (err) => {
      console.error("خطأ أثناء حذف جميع اللاعبين:", err);
    },
  });
}
