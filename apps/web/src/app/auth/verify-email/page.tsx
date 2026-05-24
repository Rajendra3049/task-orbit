import { VerifyEmailView } from "@/features/auth/components/verify-email-view";

type VerifyEmailPageProps = {
  searchParams: Promise<{
    email?: string;
    name?: string;
    next?: string;
  }>;
};

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;

  return (
    <VerifyEmailView
      email={params.email ?? ""}
      fullName={params.name ?? ""}
      nextPath={params.next ?? "/dashboard"}
    />
  );
}
