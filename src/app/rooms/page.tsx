// app/admin/rooms/create/page.tsx
"use client";

import { useAuthGuard } from "@/hooks/use-auth-guard";
import api from "@/lib/axiosClient";
import { AxiosError } from "axios";
import { useState } from "react";
import { toast } from "sonner";

// استيراد مكونات shadcn/ui
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // استخدام البطاقة لتنظيم الواجهة
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react"; // أيقونة التحميل

// أنواع الغرف المتاحة
type RoomType = "ARTICLE" | "QUIZ";

export default function CreateRoomPage() {
  // 🛡️ 1. حماية الصفحة والتحقق من الدور
  useAuthGuard(["ADMIN"], "/auth", "/403");

  const [name, setName] = useState("");
  const [type, setType] = useState<RoomType>("ARTICLE");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/rooms", { name, type });

      toast.success(`✅ تم إنشاء الغرفة بنجاح: ${response.data.name}`);
      // router.push("/admin/rooms");
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        const apiErrorMessage = error.response?.data?.message;

        if (apiErrorMessage) {
          toast.error(`خطأ من الخادم: ${apiErrorMessage}`);
        } else {
          toast.error("⚠️ فشل الاتصال بالخادم. يرجى التحقق من اتصالك.");
        }
      } else {
        toast.error("❌ حدث خطأ غير معروف. يرجى مراجعة سجلات المتصفح.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start pt-10 min-h-screen">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-gray-800">
            ➕ إنشاء غرفة جديدة
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            هذه المنطقة مخصصة للمدراء فقط.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* حقل اسم الغرفة */}
            <div className="space-y-2">
              <Label htmlFor="name">اسم الغرفة</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="مثال: مسابقة الأدب العربي"
              />
            </div>

            {/* حقل نوع الغرفة (اختيار من القائمة) */}
            <div className="space-y-2">
              <Label htmlFor="type">نوع الغرفة</Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as RoomType)}
                required
                dir="rtl"
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر نوع الغرفة" />
                </SelectTrigger>
                <SelectContent dir="rtl">
                  <SelectItem value="ARTICLE">مقالات</SelectItem>
                  <SelectItem value="QUIZ">مسابقات</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* زر الإنشاء */}
            <Button
              type="submit"
              disabled={loading || name.trim() === ""}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  جاري الإنشاء...
                </>
              ) : (
                "إنشاء الغرفة"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
