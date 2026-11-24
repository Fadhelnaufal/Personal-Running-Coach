import { signUpAction } from "@/app/(auth)/actions";
import { AuthForm } from "@/features/auth/AuthForm";
import { getPublicEnvStatus } from "@/lib/env";

export default function SignupPage() {
  const envStatus = getPublicEnvStatus();

  return (
    <AuthForm mode="signup" action={signUpAction} envConfigured={envStatus.configured} />
  );
}
