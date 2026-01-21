import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div 
        className="relative max-w-md rounded-sm bg-[#f5efe6] p-10 text-center"
        style={{
          boxShadow: '0 4px 20px rgba(44, 24, 16, 0.08)',
          border: '1px solid rgba(139, 69, 19, 0.12)',
        }}
      >
        {/* Decorative tape */}
        <div 
          className="absolute -top-3 left-1/2 -translate-x-1/2 h-6 w-20"
          style={{
            background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.6) 0%, rgba(212, 165, 116, 0.4) 100%)',
            transform: 'translateX(-50%) rotate(-2deg)',
          }}
        />

        {/* Decorative corners */}
        <div className="absolute top-3 left-3 w-5 h-5 border-l-2 border-t-2 border-[#d4a574] opacity-50" />
        <div className="absolute top-3 right-3 w-5 h-5 border-r-2 border-t-2 border-[#d4a574] opacity-50" />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-l-2 border-b-2 border-[#d4a574] opacity-50" />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-r-2 border-b-2 border-[#d4a574] opacity-50" />

        {/* Postmark-style 404 */}
        <div 
          className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-4 border-dashed border-[#722f37] opacity-80"
          style={{ transform: 'rotate(-8deg)' }}
        >
          <span className="font-[family-name:var(--font-typewriter)] text-2xl font-bold text-[#722f37]">
            404
          </span>
        </div>

        <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
          Page Not Found
        </h1>
        
        <p className="mt-3 font-[family-name:var(--font-crimson)] text-[#5c4033]">
          This piece of ephemera seems to have been lost to time. 
          Perhaps it was never meant to last.
        </p>

        <div className="mt-6">
          <Link href="/" className={buttonClasses("primary", "md")}>
            ✦ Return Home
          </Link>
        </div>

        {/* Decorative flourish */}
        <div className="mt-8 vintage-divider">
          <span className="font-[family-name:var(--font-typewriter)] text-[10px] text-[#d4a574]">✦</span>
        </div>
      </div>
    </div>
  );
}
