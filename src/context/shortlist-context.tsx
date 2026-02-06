"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

export interface ShortlistMaterial {
  id: string;
  name: string;
  category: string;
  supplierName: string;
  unitPriceRange: string;
  embodiedCarbonFactor: string;
}

interface ShortlistContextType {
  shortlist: ShortlistMaterial[];
  addToShortlist: (material: ShortlistMaterial) => void;
  removeFromShortlist: (materialId: string) => void;
  clearShortlist: () => void;
  isInShortlist: (materialId: string) => boolean;
}

const ShortlistContext = createContext<ShortlistContextType | undefined>(
  undefined,
);

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
  const [shortlist, setShortlist] = useState<ShortlistMaterial[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("material-shortlist");
    if (saved) {
      try {
        setShortlist(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse shortlist", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("material-shortlist", JSON.stringify(shortlist));
    }
  }, [shortlist, isLoaded]);

  const addToShortlist = (material: ShortlistMaterial) => {
    setShortlist((prev) => {
      if (prev.some((m) => m.id === material.id)) return prev;
      return [...prev, material];
    });
  };

  const removeFromShortlist = (materialId: string) => {
    setShortlist((prev) => prev.filter((m) => m.id !== materialId));
  };

  const clearShortlist = () => {
    setShortlist([]);
  };

  const isInShortlist = (materialId: string) => {
    return shortlist.some((m) => m.id === materialId);
  };

  return (
    <ShortlistContext.Provider
      value={{
        shortlist,
        addToShortlist,
        removeFromShortlist,
        clearShortlist,
        isInShortlist,
      }}
    >
      {children}
    </ShortlistContext.Provider>
  );
}

export function useShortlist() {
  const context = useContext(ShortlistContext);
  if (context === undefined) {
    throw new Error("useShortlist must be used within a ShortlistProvider");
  }
  return context;
}
