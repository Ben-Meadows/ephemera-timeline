import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "../actions";

export default function SignUpPage() {
  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <p className="text-sm font-semibold text-emerald-600">Get started</p>
        <h1 className="text-2xl font-semibold text-slate-900">
          Create your account
        </h1>
        <p className="text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            className="font-semibold text-emerald-700 underline"
            href="/auth/sign-in"
          >
            Sign in
          </Link>
          .
        </p>
      </div>
      <AuthForm mode="sign-up" action={signUpAction} />
    </div>
  );
}
