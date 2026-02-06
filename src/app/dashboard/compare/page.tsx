// app/dashboard/compare/page.tsx (Side-by-side comparison)
"use client";

import { useState } from "react";
import { ComparisonTable } from "@/components/ComparsionTable";
// Assume state management with Zustand for selected materials

export default function ComparePage() {
  const [selectedMaterials, _setSelectedMaterials] = useState([]); // Fetch from DB or state

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Material Comparison</h1>
      <ComparisonTable materials={selectedMaterials} />
    </div>
  );
}
