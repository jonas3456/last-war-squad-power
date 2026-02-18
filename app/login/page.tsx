import { LoginForm } from "@/components/auth/login-form";
import { AuthFooter } from "@/components/auth/auth-footer";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <LoginForm />
      <AuthFooter />
    </div>
  );
}
