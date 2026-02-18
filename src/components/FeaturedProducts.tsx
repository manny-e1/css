"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Leaf,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

interface Material {
  id: string;
  name: string;
  supplierName: string;
  origin: string | null;
  unitPriceRange: string | null;
  embodiedCarbonFactor: string;
  imageUrl: string | null;
  category: string | null;
  subCategory: { name: string } | null;
}

export function FeaturedProducts({ materials }: { materials: Material[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-play carousel
  useEffect(() => {
    if (!isAutoPlaying || materials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % materials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, materials.length]);

  if (materials.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % materials.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + materials.length) % materials.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  const currentMaterial = materials[currentIndex];
  const carbonFactor = Number.parseFloat(
    currentMaterial.embodiedCarbonFactor || "0",
  );
  const priceRange = currentMaterial.unitPriceRange || "Contact for pricing";

  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles className="h-4 w-4" />
            Featured Materials
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
            Sustainable Building Materials
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover verified, low-carbon construction materials from trusted
            local suppliers
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Main Card */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-emerald-100">
            <div className="grid md:grid-cols-2">
              {/* Image Section */}
              <div className="relative h-80 md:h-auto">
                {currentMaterial.imageUrl ? (
                  <div className="relative h-full w-full">
                    <img
                      src={currentMaterial.imageUrl}
                      alt={currentMaterial.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/95 backdrop-blur-sm text-emerald-700 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-lg">
                        {currentMaterial.subCategory?.name ||
                          currentMaterial.category ||
                          "Material"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">
                    <Building2 className="h-24 w-24 text-emerald-400" />
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div className="p-8 md:p-10 flex flex-col justify-between">
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">
                    {currentMaterial.name}
                  </h3>

                  <p className="text-emerald-600 font-semibold mb-6 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {currentMaterial.supplierName}
                  </p>

                  <div className="space-y-4 mb-8">
                    {/* Price */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="text-gray-600 font-medium">
                        Price Range
                      </span>
                      <span className="font-bold text-gray-900 text-lg">
                        ETB {priceRange}
                      </span>
                    </div>

                    {/* Carbon Factor */}
                    <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-xl">
                      <span className="text-emerald-700 font-medium flex items-center gap-2">
                        <Leaf className="h-5 w-5" />
                        Carbon Factor
                      </span>
                      <span className="font-bold text-emerald-700 text-lg">
                        {carbonFactor.toFixed(2)} kg CO₂e
                      </span>
                    </div>

                    {/* Origin */}
                    {currentMaterial.origin && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                        <span className="text-blue-700 font-medium flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Origin
                        </span>
                        <span className="font-bold text-blue-700">
                          {currentMaterial.origin}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* View Details Button */}
                <Link
                  href={`/materials/${currentMaterial.id}`}
                  className="inline-block text-center px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-300 shadow-lg font-semibold"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            type="button"
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 bg-white hover:bg-emerald-50 text-gray-800 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 border-2 border-emerald-100"
            aria-label="Previous material"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 bg-white hover:bg-emerald-50 text-gray-800 p-3 rounded-full shadow-xl transition-all duration-300 hover:scale-110 border-2 border-emerald-100"
            aria-label="Next material"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>

        {/* Dots Indicator */}
        <div className="flex justify-center gap-2 mt-8">
          {materials.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? "w-8 h-3 bg-emerald-600"
                  : "w-3 h-3 bg-gray-300 hover:bg-emerald-400"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/materials"
            className="inline-block px-8 py-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-300 shadow-lg font-semibold"
          >
            View All Materials
          </Link>
        </div>
      </div>
    </section>
  );
}
