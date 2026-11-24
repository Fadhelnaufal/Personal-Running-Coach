import { signInAction } from "@/app/(auth)/actions";
import { AuthForm } from "@/features/auth/AuthForm";
import { getPublicEnvStatus } from "@/lib/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const envStatus = getPublicEnvStatus();

  return (
    <AuthForm
      mode="login"
      action={signInAction}
      nextPath={params.next}
      envConfigured={envStatus.configured}
    />
  );
}
