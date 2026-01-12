import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "../actions";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">Welcome back</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Sign in to continue
        </h1>
        <p className="text-sm text-slate-600">
          No account?{" "}
          <Link
            className="font-semibold text-emerald-700 underline"
            href="/auth/sign-up"
          >
            Create one
          </Link>
          .
        </p>
      </div>
      <AuthForm mode="sign-in" action={signInAction} />
    </div>
  );
}
