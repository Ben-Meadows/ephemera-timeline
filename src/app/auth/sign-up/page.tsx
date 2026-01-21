import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { signUpAction } from "../actions";

export default function SignUpPage() {
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
          className="absolute -top-3 right-8 h-6 w-16"
          style={{
            background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.6) 0%, rgba(212, 165, 116, 0.4) 100%)',
            transform: 'rotate(2deg)',
          }}
        />

        {/* Header */}
        <div className="mb-8 text-center">
          {/* Wax seal decoration */}
          <div 
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, #9a3b3b, #722f37)',
              boxShadow: 'inset -2px -2px 4px rgba(0, 0, 0, 0.2), 2px 2px 8px rgba(44, 24, 16, 0.2)',
            }}
          >
            <span className="font-[family-name:var(--font-playfair)] text-xl text-[#f5efe6]">E</span>
          </div>
          
          <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-[0.2em] text-[#8b4513]">
            Join the Collection
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
            Create Your Account
          </h1>
          <p className="mt-3 font-[family-name:var(--font-crimson)] text-sm text-[#5c4033]">
            Already have an account?{" "}
            <Link
              className="font-semibold text-[#8b4513] underline decoration-[#d4a574] underline-offset-2 transition-colors hover:text-[#704214]"
              href="/auth/sign-in"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Divider */}
        <div className="vintage-divider mb-6">
          <span className="font-[family-name:var(--font-typewriter)] text-[10px] text-[#d4a574]">✦</span>
        </div>

        {/* Form */}
        <AuthForm mode="sign-up" action={signUpAction} />

        {/* Footer note */}
        <p className="mt-6 text-center font-[family-name:var(--font-crimson)] text-xs italic text-[#8b7355]">
          By creating an account, you agree to preserve your ephemera with care.
        </p>
      </div>
    </div>
  );
}
