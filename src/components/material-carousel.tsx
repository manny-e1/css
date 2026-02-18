"use client";

import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MaterialCarouselProps {
  images: string[] | null;
  fallbackImageUrl: string | null;
  materialName: string;
  categoryName: string;
}

export function MaterialCarousel({
  images,
  fallbackImageUrl,
  materialName,
  categoryName,
}: MaterialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const allImages =
    images && images.length > 0
      ? images
      : fallbackImageUrl
        ? [fallbackImageUrl]
        : [];

  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  if (allImages.length === 0) {
    return (
      <div className="relative h-48 w-full bg-muted/20 flex items-center justify-center border-b border-border/40 overflow-hidden">
        <Building2 className="h-12 w-12 text-muted-foreground/20" />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge
            variant="secondary"
            className="bg-background/90 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm"
          >
            {categoryName}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-48 w-full overflow-hidden border-b border-border/40 group/carousel">
      <div
        className="flex h-full w-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {allImages.map((img) => (
          <div key={img} className="h-full w-full shrink-0">
            <img
              src={img}
              alt={materialName}
              className="h-full w-full object-cover"
            />
          </div>
        ))}
      </div>

      {allImages.length > 1 && (
        <>
          <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover/carousel:opacity-100 transition-opacity">
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-none shadow-sm hover:bg-background"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm border-none shadow-sm hover:bg-background"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 p-1 rounded-full bg-black/20 backdrop-blur-sm">
            {allImages.map((_, idx) => (
              <div
                key={_}
                className={cn(
                  "h-1.5 w-1.5 rounded-full transition-all",
                  currentIndex === idx ? "bg-white w-3" : "bg-white/50",
                )}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute top-4 left-4 flex gap-2">
        <Badge
          variant="secondary"
          className="bg-background/90 text-primary border-none text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md backdrop-blur-sm"
        >
          {categoryName}
        </Badge>
      </div>
    </div>
  );
}
