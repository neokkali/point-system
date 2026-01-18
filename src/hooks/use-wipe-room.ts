import api from "@/lib/axiosClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useWipeRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/wipe`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["players"] });
    },
    onError: (err) => console.error("خطأ أثناء الحذف:", err),
  });
}
