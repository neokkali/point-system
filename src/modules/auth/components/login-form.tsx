import { useRouter } from "next/navigation";
import { useState } from "react";

import { AxiosError } from "axios";

import api from "@/lib/axiosClient";
import { useAuth } from "@/providers/auth-provider";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Props {
  setIsRegister: (value: boolean) => void;
}

const LoginForm = ({ setIsRegister }: Props) => {
  const router = useRouter();
  const { login } = useAuth();

  const [loaindg, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    // Handle registration logic here
    try {
      const { data } = await api.post("/auth/login", { username, password });
      login(data.user);

      toast.success("تم تسجيل الدخول بنجاح");
      router.push("/");
      router.refresh();
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        console.log("Registration error:", error.response?.data?.message);
        toast.error("معلومات الدخول غير صحيحة");
      } else {
        console.error("An unexpected error occurred:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">تسجيل الدخول</h2>
      <form onSubmit={handleRegister}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">أسم المستخدم</FieldLabel>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="أدخل أسم المستخدم هنا"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">كلمة المرور</FieldLabel>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
          </Field>

          <div className="flex flex-col justify-between">
            <Button type="submit" disabled={loaindg}>
              تسجيل الدخول
            </Button>
          </div>

          <div className="text-center">
            ليس ﻟﺪﻳﻚ ﺣﺴﺎﺏ؟{" "}
            <button
              className="text-blue-600 underline cursor-pointer"
              onClick={() => setIsRegister(true)}
            >
              إنشاء حساب
            </button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};

export default LoginForm;
