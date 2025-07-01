import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/hooks/use-auth";

export default function Login() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <LoginForm />;
}
