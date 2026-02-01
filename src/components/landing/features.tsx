"use client";

import { motion } from "motion/react";
import { Camera, Clock, Tag } from "lucide-react";
import Image from "next/image";

const features = [
  {
    title: "Capture the Texture",
    description: "Upload high-resolution photos of your spreads. We preserve every rip, stain, and texture, making your digital copy feel just as tactile as the original.",
    icon: <Camera className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1080&q=80",
    color: "bg-[#d2b48c]"
  },
  {
    title: "Mark the Moments",
    description: "Drop markers on individual items—that specific ticket stub, the pressed flower, the coffee receipt. Annotate them with dates, locations, and the stories behind them.",
    icon: <Tag className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1504198266287-1659872e6590?w=1080&q=80",
    color: "bg-[#722f37]"
  },
  {
    title: "Weave the Story",
    description: "Watch your unconnected pages transform into a chronological timeline. Filter by collection, date, or tag to see your life's journey unfold.",
    icon: <Clock className="w-6 h-6" />,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1080&q=80",
    color: "bg-[#8b4513]"
  }
];

export function Features() {
  return (
    <section className="py-32 bg-[#faf6f1] overflow-hidden">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-24 max-w-3xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[#2c1810] mb-6"
          >
            Not just a gallery. <br/> A <span className="italic text-[#8b4513]">digital archive</span>.
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="font-[family-name:var(--font-crimson)] text-xl text-[#5a3a2a]"
          >
            We&apos;ve reimagined the digital album to respect the analog soul of your memories.
          </motion.p>
        </div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <div key={index} className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
              
              <motion.div 
                initial={{ opacity: 0, x: index % 2 === 1 ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-full flex items-center justify-center text-[#faf6f1] mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="font-[family-name:var(--font-playfair)] text-3xl text-[#2c1810] mb-4">{feature.title}</h3>
                <p className="font-[family-name:var(--font-crimson)] text-xl text-[#5a3a2a] leading-relaxed mb-8">
                  {feature.description}
                </p>
                
                <div className="h-px w-24 bg-[#8b4513]/20"></div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex-1 relative"
              >
                {/* Image Frame Effect */}
                <div className="relative z-10 p-4 bg-white shadow-xl rotate-1 hover:rotate-0 transition-transform duration-500 rounded-sm">
                   {/* "Tape" Effect */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#f0e6d2]/80 rotate-2 backdrop-blur-sm shadow-sm z-20"></div>
                  
                  <div className="overflow-hidden aspect-[4/3] bg-[#faf6f1]">
                    <Image 
                      src={feature.image} 
                      alt={feature.title}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                    />
                  </div>
                  
                  <div className="mt-4 flex justify-between items-end">
                    <div className="font-[family-name:var(--font-typewriter)] text-xs text-[#8b4513] opacity-60">FIG. 0{index + 1}</div>
                    <div className="w-16 h-16 opacity-10">
                        {/* Stamp placeholder */}
                        <div className="w-full h-full border-2 border-[#2c1810] rounded-full flex items-center justify-center rotate-12">
                            <span className="text-[8px] font-bold text-[#2c1810] uppercase text-center leading-none">Ephemera<br/>Archive<br/>Auth</span>
                        </div>
                    </div>
                  </div>
                </div>
                
                {/* Decor elements */}
                <div className={`absolute -inset-4 ${feature.color} opacity-5 -z-10 rounded-lg rotate-3`}></div>
              </motion.div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
