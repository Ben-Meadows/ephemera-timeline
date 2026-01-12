"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInSchema, signUpSchema } from "@/lib/validators";

type AuthMode = "sign-in" | "sign-up";

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type FormValues = SignInValues | SignUpValues;

type AuthFormProps = {
  mode: AuthMode;
  action: (formData: FormData) => Promise<{ error?: string } | void>;
};

export function AuthForm({ mode, action }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const schema = mode === "sign-in" ? signInSchema : signUpSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    startTransition(async () => {
      const result = await action(formData);
      if (result && "error" in result) {
        setError(result.error ?? null);
      }
    });
  });

  // Type-safe register helper
  const reg = (name: keyof SignUpValues) => register(name as keyof FormValues);

  return (
    <form
      onSubmit={onSubmit}
      className="grid gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...reg("email")}
        />
        {errors.email ? (
          <p className="text-xs text-red-600">{errors.email.message}</p>
        ) : null}
      </div>

      {mode === "sign-up" ? (
        <>
          <div className="space-y-1">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="papercrafter"
              autoComplete="username"
              {...reg("username")}
            />
            {"username" in errors && errors.username ? (
              <p className="text-xs text-red-600">{errors.username.message}</p>
            ) : null}
          </div>
          <div className="space-y-1">
            <Label htmlFor="display_name">Display name (optional)</Label>
            <Input
              id="display_name"
              placeholder="Paper Crafter"
              autoComplete="name"
              {...reg("display_name")}
            />
            {"display_name" in errors && errors.display_name ? (
              <p className="text-xs text-red-600">
                {errors.display_name.message}
              </p>
            ) : null}
          </div>
        </>
      ) : null}

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
          {...reg("password")}
        />
        {errors.password ? (
          <p className="text-xs text-red-600">{errors.password.message}</p>
        ) : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Working..." : mode === "sign-in" ? "Sign in" : "Create account"}
      </Button>
    </form>
  );
}
