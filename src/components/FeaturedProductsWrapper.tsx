import { db } from "@/db/client";
import { FeaturedProducts } from "./FeaturedProducts";

export async function FeaturedProductsWrapper() {
  // Fetch approved materials, limit to 8 for the carousel
  const featuredMaterials = await db.query.materials.findMany({
    where: (materials, { eq }) => eq(materials.approved, true),
    limit: 8,
    with: {
      category: true,
      subCategory: true,
    },
  });

  if (featuredMaterials.length === 0) {
    return null;
  }

  // Transform to match the interface
  const materials = featuredMaterials.map((m) => ({
    id: m.id,
    name: m.name,
    supplierName: m.supplierName,
    origin: m.origin,
    unitPriceRange: m.unitPriceRange,
    embodiedCarbonFactor: m.embodiedCarbonFactor,
    imageUrl: m.imageUrl,
    category: m.category,
    subCategory: m.subCategory,
  }));

  return <FeaturedProducts materials={materials} />;
}

