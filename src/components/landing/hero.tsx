"use client";

import { motion } from "motion/react";
import { ArrowDown, PenTool } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-20 overflow-hidden bg-[#F1E6D2]">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <filter id="noise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noise)" />
        </svg>
      </div>

      <div className="container mx-auto px-6 z-10 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6" style={{ backgroundColor: "rgba(137,29,26,0.06)", border: "1px solid rgba(137,29,26,0.2)" }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#891D1A" }} />
            <span className="font-[family-name:var(--font-crimson)] text-xs italic text-[#891D1A]">Est. 2026</span>
          </div>

          <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl leading-[1.1] text-[#210706] mb-6">
            Your collected <br/>
            <span className="italic text-[#891D1A]">moments</span>, <br/>
            beautifully preserved.
          </h1>

          <p className="font-[family-name:var(--font-crimson)] text-xl md:text-2xl text-[#5E657B] max-w-lg mb-10 leading-relaxed">
            Upload photos of your junk journal pages. Drop markers on every ticket, postcard, and memory. Build a timeline that tells your story.
          </p>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/auth/sign-up"
              className="group relative px-8 py-4 font-[family-name:var(--font-crimson)] text-lg rounded-sm overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              style={{ backgroundColor: "#891D1A", color: "#F1E6D2" }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Your Collection
                <PenTool className="w-4 h-4" />
              </span>
              <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" style={{ backgroundColor: "#210706" }} />
            </Link>

            <Link
              href="/timeline"
              className="px-8 py-4 bg-transparent font-[family-name:var(--font-crimson)] text-lg rounded-sm transition-colors hover:bg-[#891D1A]/10"
              style={{ border: "1px solid rgba(137,29,26,0.35)", color: "#210706" }}
            >
              View Timeline
            </Link>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white rotate-1 hover:rotate-0 transition-transform duration-500 ease-out">
            <Image 
              src="/journal-hero.jpg"
              alt="Leather-bound journal with impressionist artwork and white flowers"
              width={800}
              height={1067}
              className="w-full h-auto object-cover max-h-[600px]"
              priority
            />
            
            {/* Annotated Item Overlay Example - pointing at the clock */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.2, type: "spring" }}
              className="absolute top-[28%] left-[32%]"
            >
              <div className="relative group cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#722f37]/90 border-2 border-[#faf6f1] flex items-center justify-center shadow-lg animate-pulse">
                  <div className="w-2 h-2 bg-[#faf6f1] rounded-full"></div>
                </div>
                
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-white/95 backdrop-blur-sm p-3 rounded shadow-xl min-w-[150px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto origin-left transform scale-95 group-hover:scale-100">
                  <p className="font-[family-name:var(--font-typewriter)] text-xs text-[#8b4513] mb-1">AUTUMN 1924</p>
                  <p className="font-[family-name:var(--font-crimson)] text-sm text-[#2c1810] leading-tight">Street Clock, Montmartre</p>
                </div>
              </div>
            </motion.div>
            
            {/* Second marker - pointing at the flowers */}
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: "spring" }}
              className="absolute bottom-[30%] left-[25%]"
            >
              <div className="relative group cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-[#8b4513]/80 border-2 border-[#faf6f1] flex items-center justify-center shadow-lg">
                  <div className="w-1.5 h-1.5 bg-[#faf6f1] rounded-full"></div>
                </div>
                
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 bg-white/95 backdrop-blur-sm p-3 rounded shadow-xl min-w-[140px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none md:pointer-events-auto origin-left transform scale-95 group-hover:scale-100">
                  <p className="font-[family-name:var(--font-typewriter)] text-xs text-[#8b4513] mb-1">PRESSED</p>
                  <p className="font-[family-name:var(--font-crimson)] text-sm text-[#2c1810] leading-tight">Wild jasmine flowers</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Background decorative elements */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#d2b48c]/20 rounded-full blur-3xl -z-10"></div>
          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-[#722f37]/10 rounded-full blur-3xl -z-10"></div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, repeat: Infinity, repeatType: "reverse", duration: 1.5 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#8b4513]/50"
      >
        <ArrowDown size={24} />
      </motion.div>
    </section>
  );
}
