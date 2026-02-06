// types/index.ts
export interface Material {
  id: string;
  category: string;
  name: string;
  supplierName: string;
  origin: string;
  unitPriceRange: string;
  leadTimeEstimate: string;
  embodiedCarbonFactor: number;
  certification?: string;
  approved: boolean;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  projectType?: string;
  floorArea?: number;
  selectedMaterials: Record<string, string>; // category: materialId
}
