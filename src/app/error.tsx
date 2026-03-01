"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div
        className="relative rounded-sm bg-[#f5efe6] p-10"
        style={{
          boxShadow: "0 4px 20px rgba(44, 24, 16, 0.08)",
          border: "1px solid rgba(139, 69, 19, 0.12)",
        }}
      >
        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-6 h-6 border-l-2 border-t-2 border-[#d4a574] opacity-50" />
        <div className="absolute top-3 right-3 w-6 h-6 border-r-2 border-t-2 border-[#d4a574] opacity-50" />
        <div className="absolute bottom-3 left-3 w-6 h-6 border-l-2 border-b-2 border-[#d4a574] opacity-50" />
        <div className="absolute bottom-3 right-3 w-6 h-6 border-r-2 border-b-2 border-[#d4a574] opacity-50" />

        <span className="text-4xl">📜</span>
        <h1 className="mt-4 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
          Something went wrong
        </h1>
        <p className="mt-3 font-[family-name:var(--font-crimson)] text-[#5c4033]">
          An unexpected error occurred. Your collection is safe.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="rounded-sm bg-[#8b4513] px-5 py-2.5 font-[family-name:var(--font-crimson)] text-sm text-[#f5efe6] hover:bg-[#704214] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/timeline"
            className="font-[family-name:var(--font-crimson)] text-sm text-[#8b4513] underline decoration-[#d4a574] underline-offset-2 hover:text-[#704214] transition-colors"
          >
            Back to timeline
          </Link>
        </div>
      </div>
    </div>
  );
}
