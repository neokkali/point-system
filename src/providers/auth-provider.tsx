"use client";

import { useCurrentUser } from "@/hooks/use-current-user";
import api from "@/lib/axiosClient";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data: user, isLoading, refetch } = useCurrentUser();

  const isAuthPage = pathname.startsWith("/auth");

  useEffect(() => {
    if (!isAuthPage) refetch();
  }, [pathname]);

  const login = () => refetch();

  const logout = async () => {
    await api.post("/auth/logout");

    queryClient.removeQueries({ queryKey: ["current-user"] });
    await refetch(); // user = null

    router.push("/auth");
    toast.success("تم تسجيل الخروج بنجاح");
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
