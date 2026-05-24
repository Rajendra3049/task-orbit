import { LoginForm } from "@/features/auth/components/login-form";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
    mode?: "sign-in" | "create-account";
    email?: string;
    name?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextPath = params.next || "/dashboard";
  const initialMode = params.mode === "create-account" ? "create-account" : "sign-in";
  const initialEmail = params.email || "";
  const initialName = params.name || "";

  return (
    <LoginForm
      nextPath={nextPath}
      initialMode={initialMode}
      initialEmail={initialEmail}
      initialName={initialName}
    />
  );
}
