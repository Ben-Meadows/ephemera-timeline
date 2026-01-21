import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signInAction } from "../actions";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md">
      {/* Card container */}
      <div 
        className="relative rounded-sm bg-[#f5efe6] p-8"
        style={{
          boxShadow: '0 4px 20px rgba(44, 24, 16, 0.08), inset 0 0 60px rgba(139, 69, 19, 0.02)',
          border: '1px solid rgba(139, 69, 19, 0.12)',
        }}
      >
        {/* Decorative tape */}
        <div 
          className="absolute -top-3 left-8 h-6 w-16"
          style={{
            background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.6) 0%, rgba(212, 165, 116, 0.4) 100%)',
            transform: 'rotate(-3deg)',
          }}
        />

        {/* Header */}
        <div className="mb-8 text-center">
          {/* Postmark decoration */}
          <div 
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#722f37] opacity-80"
            style={{ transform: 'rotate(-8deg)' }}
          >
            <span className="font-[family-name:var(--font-typewriter)] text-lg text-[#722f37]">✦</span>
          </div>
          
          <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-[0.2em] text-[#8b4513]">
            Welcome Back
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
            Sign In to Continue
          </h1>
          <p className="mt-3 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
            Don&apos;t have an account?{" "}
            <Link
              className="font-semibold text-[#8b4513] underline decoration-[#d4a574] underline-offset-2 transition-colors hover:text-[#704214]"
              href="/auth/sign-up"
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Divider */}
        <div className="vintage-divider mb-6">
          <span className="font-[family-name:var(--font-typewriter)] text-[10px] text-[#d4a574]">✦</span>
        </div>

        {/* Form */}
        <AuthForm mode="sign-in" action={signInAction} />
      </div>
    </div>
  );
}
