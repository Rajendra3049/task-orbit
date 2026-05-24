"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createSupabaseClient } from "@/services/supabase/client";

type VerifyEmailViewProps = {
  email: string;
  fullName: string;
  nextPath: string;
};

export function VerifyEmailView({ email, fullName, nextPath }: VerifyEmailViewProps) {
  const router = useRouter();
  const [isResending, setIsResending] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  const hasEmail = useMemo(() => /^\S+@\S+\.\S+$/.test(email), [email]);

  const checkVerificationStatus = useCallback(async (manual = false) => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      if (manual) {
        toast.error("Missing Supabase environment variables.");
      }
      return false;
    }

    setIsChecking(true);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    setIsChecking(false);

    if (error) {
      if (manual) {
        toast.error(error.message);
      }
      return false;
    }

    const emailMatches = !email || user?.email === email;
    const confirmed = Boolean(user?.email_confirmed_at && emailMatches);

    if (confirmed) {
      setIsVerified(true);
      setRedirectCountdown(3);
      if (manual) {
        toast.success("Email verified. Redirecting...");
      }
      return true;
    }

    if (manual) {
      toast.info("Still waiting for verification. Check your inbox and click the link.");
    }

    return false;
  }, [email]);

  useEffect(() => {
    let isMounted = true;
    let timer: number | undefined;

    const poll = async () => {
      const verified = await checkVerificationStatus(false);
      if (!isMounted || verified) {
        return;
      }
      timer = window.setTimeout(poll, 5000);
    };

    void poll();

    return () => {
      isMounted = false;
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [checkVerificationStatus]);

  useEffect(() => {
    if (!isVerified) {
      return;
    }

    if (redirectCountdown <= 0) {
      router.replace(nextPath);
      router.refresh();
      return;
    }

    const timer = window.setTimeout(() => {
      setRedirectCountdown((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isVerified, nextPath, redirectCountdown, router]);

  const resendEmail = async () => {
    if (!hasEmail) {
      toast.error("Email is missing or invalid. Please go back and create account again.");
      return;
    }

    const supabase = createSupabaseClient();
    if (!supabase) {
      toast.error("Missing Supabase environment variables.");
      return;
    }

    setIsResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setIsResending(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Verification email sent again.");
  };

  const goToCreateAccount = (prefill = true) => {
    const nameQuery = prefill ? `&name=${encodeURIComponent(fullName)}` : "";
    const emailQuery = prefill ? `&email=${encodeURIComponent(email)}` : "";
    router.push(`/login?mode=create-account&next=${encodeURIComponent(nextPath)}${emailQuery}${nameQuery}`);
  };

  const goToSignIn = () => {
    router.push(`/login?mode=sign-in&next=${encodeURIComponent(nextPath)}&email=${encodeURIComponent(email)}`);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg space-y-5">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">TaskOrbit</p>
          <h1 className="text-2xl font-semibold">{isVerified ? "Email verified" : "Verify your email"}</h1>
          {isVerified ? (
            <p className="text-sm text-success">
              Great! {fullName ? `${fullName}, ` : ""}your email is confirmed. You can continue now.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {fullName ? `${fullName}, ` : ""}we created your account. Confirm your email to continue.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-border bg-surface p-3 text-sm">
          <p className="text-muted-foreground">Verification email sent to:</p>
          <p className="mt-1 font-medium">{email || "Email not available"}</p>
        </div>

        {isVerified ? (
          <div className="space-y-2 rounded-xl border border-success/40 bg-success/10 p-3">
            <p className="text-sm font-medium text-success">Verification complete</p>
            <p className="text-sm text-muted-foreground">
              Redirecting to your workspace in {Math.max(0, redirectCountdown)}s. If it does not happen
              automatically, continue manually.
            </p>
          </div>
        ) : (
          <div className="space-y-2 rounded-xl border border-border bg-surface p-3">
            <p className="text-sm font-medium">What to do next</p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
              <li>Open your inbox and find the TaskOrbit verification email.</li>
              <li>Click the confirmation link in the email.</li>
              <li>Return here and click “Check verification status”.</li>
            </ol>
          </div>
        )}

        <div className="grid gap-2">
          {isVerified ? (
            <Button type="button" onClick={() => router.replace(nextPath)}>
              Continue to workspace
            </Button>
          ) : null}
          <Button type="button" variant={isVerified ? "ghost" : "primary"} onClick={() => void checkVerificationStatus(true)} disabled={isChecking}>
            {isChecking ? "Checking..." : "Check verification status"}
          </Button>
          <Button type="button" onClick={() => void resendEmail()} disabled={isResending || isVerified}>
            {isResending ? "Resending..." : "Resend confirmation email"}
          </Button>
          <Button type="button" variant="ghost" onClick={goToSignIn} disabled={isVerified}>
            I have confirmed, go to sign in
          </Button>
          <Button type="button" variant="ghost" onClick={() => goToCreateAccount(true)} disabled={isVerified}>
            Edit details and try create account again
          </Button>
          <Button type="button" variant="ghost" onClick={() => goToCreateAccount(false)} disabled={isVerified}>
            I used incorrect email
          </Button>
        </div>
      </Card>
    </main>
  );
}
