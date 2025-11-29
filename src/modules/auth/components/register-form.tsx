import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import api from "@/lib/axiosClient";
import { AxiosError } from "axios";

interface Props {
  setIsRegister: (value: boolean) => void;
}

const RegisterForm = ({ setIsRegister }: Props) => {
  const [loaindg, setLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return;

    setLoading(true);
    // Handle registration logic here
    try {
      await api.post("/auth/register", { username, password });
      // toast.success("تم إنشاء الحساب بنجاح، يمكنك تسجيل الدخول الآن");
    } catch (error: AxiosError | unknown) {
      if (error instanceof AxiosError) {
        console.error("Registration error:", error.message);
      } else {
        console.error("An unexpected error occurred:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8  rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">إنشاء حساب</h2>
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

          <Field>
            <FieldLabel htmlFor="confirm-password">
              تأكيد كلمة المرور
            </FieldLabel>
            <Input
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="********"
              required
            />
          </Field>
          {password !== confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              كلمة المرور وتأكيدها غير متطابقين
            </p>
          )}

          <div className="flex flex-col justify-between">
            <Button
              type="submit"
              disabled={password !== confirmPassword || loaindg}
            >
              تسجيل حساب
            </Button>
          </div>

          <div className="text-center">
            ﻫﻞ ﻟﺪﻳﻚ ﺣﺴﺎﺏ؟{" "}
            <button
              className="text-blue-600 underline cursor-pointer"
              onClick={() => setIsRegister(false)}
            >
              سجل الدخول
            </button>
          </div>
        </FieldGroup>
      </form>
    </div>
  );
};

export default RegisterForm;
