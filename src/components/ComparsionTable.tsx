// components/ComparisonTable.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Material {
  id: string;
  name: string;
  unitPriceRange: string;
  embodiedCarbonFactor: string;
  leadTimeEstimate: string;
  origin: string;
}

export function ComparisonTable({ materials }: { materials: Material[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Carbon Intensity</TableHead>
          <TableHead>Lead Time</TableHead>
          <TableHead>Availability</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.name}</TableCell>
            <TableCell>{m.unitPriceRange}</TableCell>
            <TableCell>{m.embodiedCarbonFactor}</TableCell>
            <TableCell>{m.leadTimeEstimate}</TableCell>
            <TableCell>{m.origin}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
