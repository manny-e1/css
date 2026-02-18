"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  createMaterialAction,
  getCategoriesAction,
} from "@/app/materials/actions";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";

export default function CreateMaterial() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    subCategoryId: "",
    description: "",
    carbonFactor: "",
    price: "",
    unit: "",
    manufacturer: "",
    origin: "",
    imageUrl: "",
    images: [] as string[],
    certifications: "",
    specifications: "",
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const cats = await getCategoriesAction();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    }
    loadCategories();
  }, []);

  if (isPending) return <div className="p-10 text-center">Loading...</div>;
  if (!session || session.user.role !== "supplier") {
    router.push("/materials");
    return null;
  }

  const selectedCategory = categories.find((c) => c.id === formData.categoryId);
  const subCategories = selectedCategory?.subCategories || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId || !formData.subCategoryId) {
      toast.error("Please select both a category and subcategory");
      return;
    }
    setLoading(true);

    try {
      const categoryName =
        categories.find((c) => c.id === formData.categoryId)?.name || "Other";

      await createMaterialAction({
        name: formData.name,
        category: categoryName,
        categoryId: formData.categoryId,
        subCategoryId: formData.subCategoryId,
        supplierName: formData.manufacturer || session?.user.name || "Unknown",
        countryOfOrigin: formData.origin || "Unknown",
        unit: formData.unit || "unit",
        unitPriceMin: parseFloat(formData.price) || 0,
        unitPriceMax: parseFloat(formData.price) || 0,
        leadTimeEstimate: "2-4 weeks", // Default or add field
        embodiedCarbonFactorPerUnit: parseFloat(formData.carbonFactor) || 0,
        images: formData.images,
        imageUrl: formData.images[0] || "", // Use first image as main imageUrl for backward compatibility
        certificationOrSourceNote: formData.certifications,
      });

      toast.success("Material created successfully! Awaiting approval.");
      router.push("/materials");
    } catch (error) {
      console.error("Failed to create material:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create material",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Create New Material</h1>
        <p className="text-gray-600">
          Add a new building material to your catalog
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Material Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Label htmlFor="name">Material Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Eco Concrete Mix"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => {
                    handleInputChange("categoryId", value);
                    handleInputChange("subCategoryId", ""); // Reset subcategory
                  }}
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory *</Label>
                <Select
                  value={formData.subCategoryId}
                  onValueChange={(value) =>
                    handleInputChange("subCategoryId", value)
                  }
                  required
                  disabled={!formData.categoryId}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue
                      placeholder={
                        formData.categoryId
                          ? "Select subcategory"
                          : "Select category first"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {subCategories.map((sub: any) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Describe your material, its properties, and applications..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="carbonFactor">
                  Carbon Factor (kgCO₂e/unit)
                </Label>
                <Input
                  id="carbonFactor"
                  type="number"
                  step="0.01"
                  value={formData.carbonFactor}
                  onChange={(e) =>
                    handleInputChange("carbonFactor", e.target.value)
                  }
                  placeholder="0.12"
                />
              </div>

              <div>
                <Label htmlFor="price">Price per Unit</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  placeholder="120.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="unit">Unit of Measurement</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => handleInputChange("unit", e.target.value)}
                  placeholder="e.g., m³, kg, m², ton"
                />
              </div>

              <div>
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) =>
                    handleInputChange("manufacturer", e.target.value)
                  }
                  placeholder="Company name"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="origin">Origin/Location</Label>
              <Input
                id="origin"
                value={formData.origin}
                onChange={(e) => handleInputChange("origin", e.target.value)}
                placeholder="e.g., Ethiopia, Kenya, Tanzania"
              />
            </div>

            <div>
              <Label>Material Images</Label>
              <ImageUpload
                value={formData.images}
                onChange={(urls) => {
                  // If urls is just one new url, we should append it, but ImageUpload passes the full new array
                  setFormData((prev) => ({ ...prev, images: urls }));
                }}
                onRemove={(url) =>
                  setFormData((prev) => ({
                    ...prev,
                    images: prev.images.filter((i) => i !== url),
                  }))
                }
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Upload one or more images of the material.
              </p>
            </div>

            <div>
              <Label htmlFor="certifications">Certifications</Label>
              <Input
                id="certifications"
                value={formData.certifications}
                onChange={(e) =>
                  handleInputChange("certifications", e.target.value)
                }
                placeholder="e.g., ISO 14001, LEED, BREEAM"
              />
            </div>

            <div>
              <Label htmlFor="specifications">Technical Specifications</Label>
              <Textarea
                id="specifications"
                value={formData.specifications}
                onChange={(e) =>
                  handleInputChange("specifications", e.target.value)
                }
                placeholder="Compressive strength, density, thermal properties, etc."
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Creating..." : "Create Material"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/materials")}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
