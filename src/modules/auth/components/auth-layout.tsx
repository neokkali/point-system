"use client";

import { useState } from "react";
import LoginForm from "./login-form";
import RegisterForm from "./register-form";

const AuthLayout = () => {
  const [isRegister, setIsRegister] = useState(false);
  return (
    <div className="flex justify-center items-center min-h-screen">
      {isRegister ? (
        <RegisterForm  setIsRegister={setIsRegister} />
      ) : (
        <LoginForm setIsRegister={setIsRegister} />
      )}
    </div>
  );
};

export default AuthLayout;
