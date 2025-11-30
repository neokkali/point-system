"use client";

import api from "@/lib/axiosClient";
import { useAuth } from "@/providers/auth-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface LoginInputs {
  username: string;
  password: string;
}

export function useLogin(onSuccessRedirect: (roomId: string) => void) {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (data: LoginInputs) => {
      const res = await api.post("/auth/login", data);
      return res.data;
    },
    onSuccess: (data) => {
      login(data.user); // حفظ المستخدم في auth context
      toast.success("تم تسجيل الدخول بنجاح");

      // توجيه المستخدم حسب أول غرفة له
      if (data.rooms && data.rooms.length > 0) {
        onSuccessRedirect(data.rooms[0].id);
      } else {
        onSuccessRedirect("/"); // fallback
      }
    },
    onError: () => {
      toast.error("معلومات الدخول غير صحيحة");
    },
  });
}
