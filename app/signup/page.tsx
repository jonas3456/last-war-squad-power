import { SignupForm } from "@/components/auth/signup-form";
import { AuthFooter } from "@/components/auth/auth-footer";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <SignupForm />
      <AuthFooter />
    </div>
  );
}
