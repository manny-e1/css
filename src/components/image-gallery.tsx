"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState(images[0] || "");

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-muted/20 rounded-2xl flex items-center justify-center border border-border/40">
        <span className="text-muted-foreground/40 text-xs font-bold uppercase tracking-widest">
          No images available
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="aspect-square relative overflow-hidden rounded-2xl border border-border/40 bg-muted/5 group">
        <img
          src={selectedImage}
          alt="Material preview"
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((url) => (
            <button
              key={url}
              type="button"
              onClick={() => setSelectedImage(url)}
              className={cn(
                "relative aspect-square w-20 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                selectedImage === url
                  ? "border-primary"
                  : "border-transparent opacity-60 hover:opacity-100",
              )}
            >
              <img
                src={url}
                alt="Material thumbnail"
                className="object-cover w-full h-full"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
