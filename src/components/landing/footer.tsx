import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#210706] text-[#F1E6D2] py-16" style={{ borderTop: "2px solid #891D1A" }}>
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-[#faf6f1] rounded-full flex items-center justify-center text-[#2c1810]">
                <span className="font-[family-name:var(--font-typewriter)] text-sm">ET</span>
              </div>
              <span className="font-[family-name:var(--font-playfair)] text-2xl">
                Ephemera Timeline
              </span>
            </div>
            <p className="font-[family-name:var(--font-crimson)] text-lg text-[#F1E6D2]/80 max-w-sm">
              Dedicated to the preservation of transient paper artifacts. Build your digital archive today.
            </p>
          </div>
          
          <div>
            <h4 className="font-[family-name:var(--font-typewriter)] text-sm uppercase tracking-widest !text-[#F1E6D2] mb-6">Explore</h4>
            <ul className="space-y-4 font-[family-name:var(--font-crimson)] text-lg text-[#F1E6D2]">
              <li><Link href="/timeline" className="hover:text-[#d2b48c] transition-colors">My Timeline</Link></li>
              <li><Link href="/timelines" className="hover:text-[#d2b48c] transition-colors">Collections</Link></li>
              <li><Link href="/new" className="hover:text-[#d2b48c] transition-colors">New Page</Link></li>
              <li><Link href="/auth/sign-up" className="hover:text-[#d2b48c] transition-colors">Get Started</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-[family-name:var(--font-typewriter)] text-sm uppercase tracking-widest !text-[#F1E6D2] mb-6">Legal</h4>
            <ul className="space-y-4 font-[family-name:var(--font-crimson)] text-lg text-[#F1E6D2]">
              <li><span className="text-[#F1E6D2]/70 cursor-default">Privacy Policy</span></li>
              <li><span className="text-[#F1E6D2]/70 cursor-default">Terms of Service</span></li>
              <li><span className="text-[#F1E6D2]/70 cursor-default">Cookie Policy</span></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-[#faf6f1]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-[family-name:var(--font-crimson)] text-[#F1E6D2]/60 text-sm">
            © 2026 Ephemera Timeline. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
             {/* Social placeholders */}
             <div className="w-5 h-5 bg-[#faf6f1]/20 rounded-full"></div>
             <div className="w-5 h-5 bg-[#faf6f1]/20 rounded-full"></div>
             <div className="w-5 h-5 bg-[#faf6f1]/20 rounded-full"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
