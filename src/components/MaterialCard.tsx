// components/MaterialCard.tsx (Same as before, minor updates)
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Material {
  id: string;
  name: string;
  supplierName: string;
  origin: string;
  unitPriceRange: string;
  embodiedCarbonFactor: string;
  leadTimeEstimate: string;
}

export function MaterialCard({ material }: { material: Material }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{material.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {material.supplierName} • {material.origin}
        </p>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2">
          <dt>Price</dt>
          <dd>{material.unitPriceRange} per unit</dd>
          <dt>Carbon</dt>
          <dd>{material.embodiedCarbonFactor} kg CO₂e/unit</dd>
          <dt>Lead time</dt>
          <dd>{material.leadTimeEstimate}</dd>
        </dl>
        <Button className="mt-4 w-full">Contact Supplier</Button>
      </CardContent>
    </Card>
  );
}
