"use client";

import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import Link from "next/link";

export function HeroSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background - Abstract material texture */}
      <div className="absolute inset-0 z-0">
        <ImageWithFallback
          src="/bg.png"
          alt="Material texture"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-br from-slate-900/50 via-emerald-900/35 to-slate-900/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 text-center">
        <h1 className="text-5xl md:text-6xl lg:text-7xl mb-8 text-white leading-tight">
          Source smart, Build sustainablyly
        </h1>

        <p className="text-xl md:text-2xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
          Carbon Smart Spaces by KINE MODU helps construction professionals
          discover verified local materials with price and carbon clarity.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/supplier/register"
            className="px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 min-w-[240px] shadow-lg text-center"
          >
            List materials as a supplier
          </Link>
          <button
            type="button"
            onClick={() => scrollToSection("partnerships")}
            className="px-8 py-4 bg-white text-slate-900 rounded-lg hover:bg-gray-100 transition-all duration-300 min-w-[240px] shadow-lg"
          >
            Explore partnerships
          </button>
        </div>
      </div>
    </section>
  );
}
