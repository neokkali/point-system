// lib/axiosClient.ts

import axios from "axios";

// 1. العميل الأساسي (api): يستخدم لجميع الطلبات ويتضمن Interceptor التجديد.
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// 2. عميل التجديد (refreshClient): يستخدم فقط لطلب التجديد ولا يتضمن Interceptor.
const refreshClient = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// متغير لحماية حالة السباق (Concurrency) ومنع عدة طلبات تجديد في آن واحد
let isRefreshing = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // إذا عاد الخطأ 401 (غير مصرح) ولم نقم بإعادة المحاولة بعد
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // 🛡️ الحماية من حالة السباق: فقط طلب واحد يدخل لعملية التجديد
      if (!isRefreshing) {
        isRefreshing = true;

        try {
          // 🔄 محاولة التجديد: نستخدم العميل المنفصل (refreshClient)
          await refreshClient.post("/auth/refresh");

          isRefreshing = false; // التجديد نجح

          // إعادة تنفيذ الطلب الأصلي
          return api(originalRequest);
        } catch (refreshError) {
          isRefreshing = false; // التجديد فشل

          // 🛑 كسر اللوب: إذا فشل التجديد، نوجه المستخدم فوراً.
          // نستخدم window.location.href لضمان التوجيه وتحديث الصفحة بالكامل.
          // window.location.href = "/auth"; // 👈🏻 تم التوجيه إلى مسارك الصحيح: /auth
          return Promise.reject(refreshError);
        }
      } else {
        // إذا كان هناك تجديد قيد التنفيذ، يتم رفض الطلب الحالي
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
