"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

const collections = [
  { title: "Japan 2023", items: "14 items", date: "Sep 2023", color: "bg-[#e8dcc5]" },
  { title: "Grandma's Letters", items: "42 items", date: "1945-1950", color: "bg-[#d8c3b6]" },
  { title: "Coffee Shops", items: "8 items", date: "Ongoing", color: "bg-[#dcd0c0]" },
  { title: "Botanical Garden", items: "21 items", date: "May 2024", color: "bg-[#c5d0c0]" },
];

export function Showcase() {
  return (
    <section className="py-24 bg-[#f2ede6] border-t border-[#8b4513]/5 relative">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl text-[#2c1810] mb-2">Recent Collections</h2>
            <p className="font-[family-name:var(--font-crimson)] text-lg text-[#5a3a2a]">Curated memories from the community.</p>
          </div>
          <Link 
            href="/timelines"
            className="hidden md:flex items-center gap-2 text-[#8b4513] hover:text-[#722f37] font-[family-name:var(--font-crimson)] text-lg font-medium transition-colors"
          >
            View All Collections <ArrowRight size={18} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((collection, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group cursor-pointer"
            >
              <div className={`relative aspect-[3/4] ${collection.color} p-6 shadow-md transition-shadow group-hover:shadow-xl rounded-sm flex flex-col justify-between overflow-hidden`}>
                {/* Paper texture overlay */}
                <div 
                  className="absolute inset-0 opacity-20 pointer-events-none mix-blend-multiply"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`
                  }}
                ></div>
                
                <div className="relative z-10 flex justify-between items-start">
                  <span className="font-[family-name:var(--font-typewriter)] text-xs text-[#2c1810]/60 tracking-widest uppercase">{collection.date}</span>
                  <div className="w-8 h-8 rounded-full border border-[#2c1810]/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight size={12} className="text-[#2c1810]" />
                  </div>
                </div>

                <div className="relative z-10 text-center">
                    <h3 className="font-[family-name:var(--font-playfair)] text-2xl text-[#2c1810] mb-2">{collection.title}</h3>
                    <div className="w-8 h-px bg-[#2c1810]/20 mx-auto mb-2"></div>
                    <p className="font-[family-name:var(--font-crimson)] text-sm text-[#5a3a2a] italic">{collection.items}</p>
                </div>

                {/* Decorative corner */}
                <div className="absolute bottom-0 right-0 w-12 h-12 bg-black/5 -rotate-45 translate-y-6 translate-x-6"></div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-12 text-center md:hidden">
            <Link 
              href="/timelines"
              className="inline-flex items-center gap-2 text-[#8b4513] hover:text-[#722f37] font-[family-name:var(--font-crimson)] text-lg font-medium transition-colors"
            >
                View All Collections <ArrowRight size={18} />
            </Link>
        </div>
      </div>
    </section>
  );
}
