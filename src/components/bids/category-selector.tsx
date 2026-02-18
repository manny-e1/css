"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";

interface Category {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  categoryId: string;
}

interface CategorySelectorProps {
  categories: Category[];
  initialCategory?: string;
  initialSubCategory?: string;
}

export function CategorySelector({
  categories,
  initialCategory,
  initialSubCategory,
}: CategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    initialCategory || "",
  );
  const [selectedSubCategory, setSelectedSubCategory] = useState(
    initialSubCategory || "",
  );

  const currentCategory = categories.find((c) => c.name === selectedCategory);
  const subCategories = currentCategory?.subCategories || [];

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
          Category
        </Label>
        <div className="relative">
          <select
            name="category"
            required
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setSelectedSubCategory(""); // Reset subcategory when category changes
            }}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
          >
            <option value="">Select a category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">
          Sub-Category
        </Label>
        <div className="relative">
          <select
            name="subCategory"
            value={selectedSubCategory}
            onChange={(e) => setSelectedSubCategory(e.target.value)}
            disabled={!selectedCategory || subCategories.length === 0}
            className="w-full h-11 px-4 rounded-xl border border-border bg-background text-sm font-bold focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a sub-category</option>
            {subCategories.map((sc) => (
              <option key={sc.id} value={sc.name}>
                {sc.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
