import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 py-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-sm bg-[#f5efe6] p-8 sm:p-12"
        style={{
          boxShadow: '0 4px 20px rgba(44, 24, 16, 0.08), inset 0 0 80px rgba(139, 69, 19, 0.03)',
          border: '1px solid rgba(139, 69, 19, 0.12)',
        }}
      >
        {/* Decorative corner stamps */}
        <div className="absolute top-4 right-4 opacity-20">
          <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
            <circle cx="30" cy="30" r="28" stroke="#722f37" strokeWidth="2" strokeDasharray="4 2"/>
            <text x="30" y="25" textAnchor="middle" fill="#722f37" fontSize="8" fontFamily="monospace">EPHEMERA</text>
            <text x="30" y="38" textAnchor="middle" fill="#722f37" fontSize="10" fontFamily="serif">✦</text>
          </svg>
        </div>

        <div className="relative z-10 grid gap-8 sm:grid-cols-2 sm:items-center sm:gap-12">
          <div className="space-y-6">
            {/* Typewriter label */}
            <p className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-[0.25em] text-[#8b4513]">
              ✦ Preserve Your Paper Treasures ✦
            </p>
            
            {/* Main headline */}
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-semibold leading-tight text-[#2c1810] sm:text-4xl lg:text-5xl">
              Your Collected{" "}
              <span className="relative inline-block">
                <span className="relative z-10">Moments</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-[#d4a574]/30 -z-0" />
              </span>
              , Beautifully Preserved
            </h1>

            {/* Description */}
            <p className="font-[family-name:var(--font-crimson)] text-lg leading-relaxed text-[#5c4033]">
              Upload photos of your junk journal pages. Drop markers on every ticket, 
              postcard, receipt, and scrap of memory. Build a timeline of the ephemera 
              that tells your story.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/auth/sign-up"
                className={buttonClasses("primary", "lg")}
              >
                ✦ Start Your Collection
              </Link>
              <Link
                href="/timeline"
                className={buttonClasses("secondary", "lg")}
              >
                View Timeline
              </Link>
            </div>
          </div>

          {/* Demo Card - styled like a scrapbook page */}
          <div className="relative">
            {/* Tape decoration */}
            <div 
              className="absolute -top-3 left-1/2 z-20 h-6 w-20 -translate-x-1/2"
              style={{
                background: 'linear-gradient(180deg, rgba(212, 165, 116, 0.7) 0%, rgba(212, 165, 116, 0.5) 100%)',
                transform: 'translateX(-50%) rotate(-2deg)',
              }}
            />
            
            <div 
              className="relative rounded-sm bg-[#faf6f1] p-5"
              style={{
                boxShadow: '4px 6px 20px rgba(44, 24, 16, 0.12), 0 2px 4px rgba(44, 24, 16, 0.06)',
                border: '1px solid rgba(139, 69, 19, 0.15)',
                transform: 'rotate(1deg)',
              }}
            >
              {/* Mini timeline header */}
              <div className="mb-4 flex items-center justify-between">
                <span className="font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-wider text-[#8b4513]">
                  Recent Pages
                </span>
                <div 
                  className="rounded-full border-2 border-[#722f37] px-2 py-0.5 font-[family-name:var(--font-typewriter)] text-[9px] text-[#722f37]"
                  style={{ transform: 'rotate(-6deg)' }}
                >
                  DEMO
                </div>
              </div>

              {/* Sample page card */}
              <div 
                className="rounded-sm bg-[#f5efe6] p-4"
                style={{
                  boxShadow: 'inset 0 0 20px rgba(139, 69, 19, 0.04)',
                  border: '1px solid rgba(139, 69, 19, 0.1)',
                }}
              >
                {/* Postmark date */}
                <div className="mb-3 flex items-center gap-3">
                  <div 
                    className="flex flex-col items-center rounded-full border-2 border-[#722f37] px-2 py-1 opacity-75"
                    style={{ transform: 'rotate(-10deg)' }}
                  >
                    <span className="font-[family-name:var(--font-typewriter)] text-[8px] leading-none text-[#722f37]">FEB</span>
                    <span className="font-[family-name:var(--font-typewriter)] text-sm font-bold leading-none text-[#722f37]">14</span>
                  </div>
                  <span className="rounded-sm border border-[#8b4513] bg-[#faf6f1] px-2 py-0.5 font-[family-name:var(--font-typewriter)] text-[9px] uppercase text-[#8b4513]">
                    Public
                  </span>
                </div>

                {/* Placeholder image */}
                <div 
                  className="mb-3 h-28 rounded-sm"
                  style={{
                    background: 'linear-gradient(135deg, #e8dfd3 0%, #d4c4b0 50%, #e8dfd3 100%)',
                    border: '2px solid #f5efe6',
                    outline: '1px solid rgba(139, 69, 19, 0.1)',
                  }}
                >
                  <div className="flex h-full items-center justify-center">
                    <span className="font-[family-name:var(--font-typewriter)] text-xs text-[#8b7355]">
                      [ Your Photo Here ]
                    </span>
                  </div>
                </div>

                {/* Title and caption */}
                <h3 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-[#2c1810]">
                  Kyoto Transit Tickets
                </h3>
                <p className="mt-1 font-[family-name:var(--font-crimson)] text-xs italic text-[#5c4033]">
                  Train stubs, temple stamps, and coffee receipts from the trip...
                </p>
              </div>

              {/* Annotation hint */}
              <p className="mt-3 text-center font-[family-name:var(--font-typewriter)] text-[10px] text-[#8b4513]">
                Click to annotate items on each page
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What is Ephemera section */}
      <section className="text-center">
        <div className="vintage-divider mb-6">
          <span className="font-[family-name:var(--font-typewriter)] text-xs uppercase tracking-wider text-[#8b4513]">
            What is Ephemera?
          </span>
        </div>
        <p className="mx-auto max-w-3xl font-[family-name:var(--font-crimson)] text-lg leading-relaxed text-[#5c4033]">
          <span className="font-[family-name:var(--font-playfair)] text-xl italic text-[#2c1810]">Ephemera</span> are 
          transient items—often paper-based—created for a short-term purpose but sometimes 
          collected for their historical or sentimental value. Tickets, postcards, flyers, 
          menus, receipts, old letters, and photographs. They offer unique insights into 
          everyday life, history, and culture, despite being designed not to last.
        </p>
      </section>

      {/* Features Section */}
      <section 
        className="rounded-sm bg-[#f5efe6] p-8"
        style={{
          boxShadow: '0 2px 12px rgba(44, 24, 16, 0.06)',
          border: '1px solid rgba(139, 69, 19, 0.1)',
        }}
      >
        <div className="mb-8 text-center">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
            How It Works
          </h2>
          <p className="mt-2 font-[family-name:var(--font-crimson)] text-[#5c4033]">
            Three simple steps to preserve your paper treasures
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {[
            {
              number: "01",
              title: "Upload Your Pages",
              body: "Photograph your junk journal spreads, scrapbook pages, or collected ephemera and upload to your private timeline.",
              icon: "📄",
            },
            {
              number: "02", 
              title: "Drop Annotations",
              body: "Click anywhere on your image to mark tickets, receipts, stamps, or any item. Add labels, dates, and stories.",
              icon: "📍",
            },
            {
              number: "03",
              title: "Share or Keep Private",
              body: "Build your chronological timeline. Share publicly, keep unlisted, or store privately for yourself.",
              icon: "🔐",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-sm bg-[#faf6f1] p-6 transition-all duration-200 hover:-translate-y-1"
              style={{
                boxShadow: '2px 3px 8px rgba(44, 24, 16, 0.06)',
                border: '1px solid rgba(139, 69, 19, 0.1)',
              }}
            >
              {/* Number badge */}
              <div 
                className="absolute -top-3 -left-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#8b4513] bg-[#f5efe6]"
                style={{ transform: 'rotate(-8deg)' }}
              >
                <span className="font-[family-name:var(--font-typewriter)] text-xs font-bold text-[#8b4513]">
                  {feature.number}
                </span>
              </div>

              <div className="mb-3 text-2xl">{feature.icon}</div>
              
              <h3 className="mb-2 font-[family-name:var(--font-playfair)] text-lg font-semibold text-[#2c1810]">
                {feature.title}
              </h3>
              <p className="font-[family-name:var(--font-crimson)] text-sm leading-relaxed text-[#5c4033]">
                {feature.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to action */}
      <section className="text-center py-8">
        <div 
          className="inline-block rounded-sm bg-[#f5efe6] px-12 py-8"
          style={{
            boxShadow: '0 4px 20px rgba(44, 24, 16, 0.08)',
            border: '1px solid rgba(139, 69, 19, 0.12)',
          }}
        >
          <h2 className="mb-4 font-[family-name:var(--font-playfair)] text-2xl font-semibold text-[#2c1810]">
            Ready to Start Collecting?
          </h2>
          <p className="mb-6 font-[family-name:var(--font-crimson)] text-[#5c4033]">
            Create your free account and begin preserving your paper memories.
          </p>
          <Link
            href="/auth/sign-up"
            className={buttonClasses("primary", "lg")}
          >
            ✦ Create Your Timeline
          </Link>
        </div>
      </section>

      {/* Footer flourish */}
      <div className="vintage-divider">
        <span className="font-[family-name:var(--font-typewriter)] text-[10px] uppercase tracking-widest text-[#d4a574]">
          Est. 2024
        </span>
      </div>
    </div>
  );
}
