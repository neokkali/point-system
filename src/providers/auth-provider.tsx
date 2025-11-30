"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import api from "@/lib/axiosClient";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect } from "react";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const { data: user, isLoading, refetch } = useCurrentUser();

  // تجاهل صفحة /auth
  const isAuthPage =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/auth");

  useEffect(() => {
    if (isAuthPage) return;
    refetch(); // تحديث المستخدم عند التنقل
  }, [router, isAuthPage, refetch]);

  const login = () => {
    // بعد تسجيل الدخول جلب بيانات /auth/me من السيرفر
    refetch();
  };

  const logout = async () => {
    await api.post("/auth/logout");
    router.push("/auth");
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        loading: isLoading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
