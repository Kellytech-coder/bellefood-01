import type { Metadata } from "next";
import PasswordRecovery from "@/components/auth/PasswordRecovery";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return <PasswordRecovery />;
}
