// hooks/use-rooms.ts
"use client";

import api from "@/lib/axiosClient";
import { useQuery } from "@tanstack/react-query";

export const useRooms = () => {
  return useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await api.get("/rooms"); // استخدم api بدل axios
      if (!res.data) throw new Error("No data returned from API");
      return res.data; // يجب أن ترجع بيانات صحيحة دائمًا
    },
    staleTime: 1000 * 60, // اختياري: اجعل البيانات صالحة لمدة دقيقة قبل إعادة الجلب
  });
};
