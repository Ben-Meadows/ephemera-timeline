"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthMode = "sign-in" | "sign-up";

type AuthFormProps = {
  mode: AuthMode;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result) {
        setError(result.error ?? null);
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-5"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </div>

      {mode === "sign-up" ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              placeholder="papercrafter"
              autoComplete="username"
              required
              minLength={3}
              maxLength={30}
              pattern="^[a-zA-Z0-9_]+$"
              title="Letters, numbers, and underscores only"
            />
            <p className="font-[family-name:var(--font-crimson)] text-xs italic text-[#8b7355]">
              This will be your public profile URL
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="display_name">Display Name <span className="font-normal text-[#8b7355]">(optional)</span></Label>
            <Input
              id="display_name"
              name="display_name"
              placeholder="Paper Crafter"
              autoComplete="name"
              maxLength={80}
            />
          </div>
        </>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          required
          minLength={6}
        />
        {mode === "sign-up" && (
          <p className="font-[family-name:var(--font-crimson)] text-xs italic text-[#8b7355]">
            At least 6 characters
          </p>
        )}
      </div>

      {error ? (
        <div 
          className="rounded-sm border border-[#722f37]/30 bg-[#722f37]/5 px-4 py-3"
        >
          <p className="font-[family-name:var(--font-crimson)] text-sm text-[#722f37]">{error}</p>
        </div>
      ) : null}

      <Button type="submit" disabled={pending} className="mt-2">
        {pending 
          ? "Working..." 
          : mode === "sign-in" 
            ? "✦ Sign In" 
            : "✦ Create Account"
        }
      </Button>
    </form>
  );
}
