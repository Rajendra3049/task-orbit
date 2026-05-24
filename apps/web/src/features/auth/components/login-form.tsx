"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { createSupabaseClient } from "@/services/supabase/client";

type LoginFormProps = {
  nextPath: string;
  initialMode?: AuthMode;
  initialEmail?: string;
  initialName?: string;
};

type AuthMode = "sign-in" | "create-account";

export function LoginForm({
  nextPath,
  initialMode = "sign-in",
  initialEmail = "",
  initialName = "",
}: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState(initialName);
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = () => {
    const normalized = email.trim();
    if (!normalized) {
      toast.error("Please enter your email.");
      return false;
    }

    const isEmailLike = /^\S+@\S+\.\S+$/.test(normalized);
    if (!isEmailLike) {
      toast.error("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const validateName = () => {
    if (!fullName.trim()) {
      toast.error("Please enter your full name.");
      return false;
    }

    if (fullName.trim().length < 2) {
      toast.error("Name should be at least 2 characters.");
      return false;
    }

    return true;
  };

  const validatePassword = (isRequired: boolean) => {
    const normalized = password.trim();
    if (!normalized && isRequired) {
      toast.error("Please enter your password.");
      return false;
    }

    if (normalized && normalized.length < 6) {
      toast.error("Password should be at least 6 characters.");
      return false;
    }

    return true;
  };

  const getSupabase = () => {
    const supabase = createSupabaseClient();
    if (!supabase) {
      toast.error("Missing Supabase environment variables.");
      return null;
    }
    return supabase;
  };

  const signInWithPassword = async () => {
    if (!validateEmail() || !validatePassword(true)) {
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Signed in successfully.");
    router.push(nextPath);
    router.refresh();
  };

  const createAccount = async () => {
    if (!validateName() || !validateEmail() || !validatePassword(true)) {
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      return;
    }

    setIsLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName.trim(),
        },
      },
    });
    setIsLoading(false);

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        toast.error("This email is already registered. Please sign in instead.");
        setMode("sign-in");
        setPassword("");
        return;
      }
      toast.error(error.message);
      return;
    }

    const isExistingUserWithoutNewIdentity =
      !!data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;

    if (isExistingUserWithoutNewIdentity) {
      toast.error("This email is already in use. Please sign in with your existing account.");
      setMode("sign-in");
      setPassword("");
      return;
    }

    if (data.user && data.user.id) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName.trim(),
      });
    }

    const verifyUrl = `/auth/verify-email?email=${encodeURIComponent(
      email.trim(),
    )}&name=${encodeURIComponent(fullName.trim())}&next=${encodeURIComponent(nextPath)}`;
    router.push(verifyUrl);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">TaskOrbit</p>
          <h1 className="mt-2 text-2xl font-semibold">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your workspace and continue your productivity flow.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm transition ${
              mode === "sign-in" ? "bg-surface-elevated text-foreground" : "text-muted-foreground"
            }`}
            onClick={() => {
              setMode("sign-in");
              setPassword("");
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-2 text-sm transition ${
              mode === "create-account" ? "bg-surface-elevated text-foreground" : "text-muted-foreground"
            }`}
            onClick={() => setMode("create-account")}
          >
            Create account
          </button>
        </div>

        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (mode === "sign-in") {
              void signInWithPassword();
              return;
            }

            void createAccount();
          }}
        >
          {mode === "create-account" ? (
            <Input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          ) : null}

          <Input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading
              ? mode === "sign-in"
                ? "Signing in..."
                : "Creating account..."
              : mode === "sign-in"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground">
          Authentication is enforced via route protection. Use email and password to sign in.
        </p>
      </Card>
    </main>
  );
}
