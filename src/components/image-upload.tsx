"use client";

import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
}

declare global {
  interface Window {
    cloudinary: any;
  }
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onRemove,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    // Load Cloudinary widget script
    const script = document.createElement("script");
    script.src = "https://upload-widget.cloudinary.com/global/all.js";
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const onUpload = () => {
    if (!isLoaded || !window.cloudinary) return;

    let currentImages = [...value];

    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        uploadPreset:
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "css_preset",
        multiple: true,
        sources: ["local", "url", "camera"],
        resourceType: "image",
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          currentImages = [...currentImages, result.info.secure_url];
          onChange(currentImages);
        }
      },
    );
    widget.open();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-wrap gap-4">
        {value.map((url) => (
          <div
            key={url}
            className="relative w-[150px] h-[150px] rounded-md overflow-hidden border border-border"
          >
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <img
              className="object-cover w-full h-full"
              alt="Material preview"
              src={url}
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        disabled={!isLoaded}
        variant="outline"
        onClick={onUpload}
        className="flex items-center gap-2"
      >
        <ImagePlus className="h-4 w-4" />
        Upload Images
      </Button>
    </div>
  );
};
