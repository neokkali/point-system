"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "@/lib/axiosClient";

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const isAuthPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/auth");

    // 🛑 الشرط الجذري: لا تقم بجلب المستخدم إذا كنا على صفحة المصادقة!
    if (isAuthPage) {
      setLoading(false);
      return;
    }

    async function loadUser() {
      // ... (باقي كود try/catch/finally لجلب المستخدم) ...
      try {
        setLoading(true);
        const res = await api.get("/auth/me");
        if (res.data.user) {
          setUser(res.data.user as User);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [router]); // استخدام router في الـ dependencies يضمن التشغيل عند التوجيه

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      router.push("/auth");
      router.refresh(); // مهم لتحديث الكوكيز في الـ Server Components
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom Hook للاستخدام السهل
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
