"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth } from "@/lib/auth";
import type { MaterialWithRanges } from "./actions";
import {
  listApprovedMaterialsAction,
  updateMaterialRangesAction,
} from "./actions";

export default async function AdminRangeAdjustmentPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const materials = await listApprovedMaterialsAction();

  async function updateRanges(formData: FormData) {
    "use server";
    const materialId = String(formData.get("materialId"));
    const unitPriceRange = String(formData.get("unitPriceRange"));
    const embodiedCarbonFactor = String(formData.get("embodiedCarbonFactor"));
    const leadTimeEstimate = String(formData.get("leadTimeEstimate"));

    await updateMaterialRangesAction({
      materialId,
      unitPriceRange,
      embodiedCarbonFactor,
      leadTimeEstimate,
    });
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Manual Range Adjustment</h1>

      <div className="grid gap-6">
        {materials.map((material: MaterialWithRanges) => (
          <Card key={material.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {material.name} • {material.category}
              </CardTitle>
              <p className="text-sm text-gray-600">
                Supplier: {material.supplierName} • Origin: {material.origin}
              </p>
            </CardHeader>
            <CardContent>
              <form action={updateRanges} className="space-y-4">
                <input type="hidden" name="materialId" value={material.id} />

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor={`price-${material.id}`}>
                      Price Range (e.g., "80-120")
                    </Label>
                    <Input
                      id={`price-${material.id}`}
                      name="unitPriceRange"
                      defaultValue={material.unitPriceRange}
                      placeholder="80-120"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`carbon-${material.id}`}>
                      Carbon Factor (kgCO₂e/unit)
                    </Label>
                    <Input
                      id={`carbon-${material.id}`}
                      name="embodiedCarbonFactor"
                      defaultValue={material.embodiedCarbonFactor}
                      placeholder="0.5"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor={`leadtime-${material.id}`}>
                      Lead Time Estimate
                    </Label>
                    <Input
                      id={`leadtime-${material.id}`}
                      name="leadTimeEstimate"
                      defaultValue={material.leadTimeEstimate}
                      placeholder="2-3 weeks"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">Update Ranges</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}

        {materials.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">
                No approved materials found.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
