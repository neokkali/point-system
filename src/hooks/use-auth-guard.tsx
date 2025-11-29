// hooks/useAuthGuard.ts

import { useAuth } from "@/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook لحماية المسارات والتحقق من صلاحيات المستخدم (Role-Based Access Control).
 * @param requiredRoles مصفوفة بالأدوار المسموح لها بالدخول (مثال: ['ADMIN']).
 * @param redirectUrl مسار التوجيه عند عدم المصادقة (مثال: '/auth').
 * @param unauthorizedRedirectUrl مسار التوجيه عند عدم وجود الصلاحية الكافية (مثال: '/403').
 */
export const useAuthGuard = (
  requiredRoles: string[] = [],
  redirectUrl: string = "/auth",
  unauthorizedRedirectUrl: string = "/403"
) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. ⏳ أثناء التحميل، لا تفعل شيئاً
    if (loading) {
      return;
    }

    // 2. 🛑 إذا لم يكن المستخدم مصرحاً له، وجهه لصفحة المصادقة
    if (!isAuthenticated) {
      router.push(redirectUrl);
      return;
    }

    // 3. 🔑 التحقق من الدور (RBAC):
    if (requiredRoles.length > 0) {
      // تحقق مما إذا كان دور المستخدم موجوداً ضمن الأدوار المطلوبة
      const userHasRequiredRole = requiredRoles.includes(user?.role || "");

      if (!userHasRequiredRole) {
        // إذا كان المستخدم مصرحاً له لكن دوره غير كافٍ، وجهه لصفحة 403
        router.push(unauthorizedRedirectUrl);
      }
    }

    // 4. ✅ إذا تم اجتياز جميع الفحوصات، استمر في عرض الصفحة
  }, [
    loading,
    isAuthenticated,
    user,
    router,
    requiredRoles,
    redirectUrl,
    unauthorizedRedirectUrl,
  ]);
};
