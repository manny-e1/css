import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateCarbon(floorArea: number, carbonFactor: number) {
  return floorArea * carbonFactor; // Simple directional calc
}
