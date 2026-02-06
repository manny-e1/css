// components/MaterialTable.tsx (For admin)

import { eq } from "drizzle-orm";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { db } from "@/db/client";
import { materials } from "@/db/new-schema";

interface Material {
  id: string;
  name: string;
  category: string;
}

export async function MaterialTable({
  materials: initialMaterials,
}: {
  materials: Material[];
}) {
  // Approve function (server action)
  const approveMaterial = async (id: string) => {
    "use server";
    await db
      .update(materials)
      .set({ approved: true })
      .where(eq(materials.id, id));
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {initialMaterials.map((m) => (
          <TableRow key={m.id}>
            <TableCell>{m.name}</TableCell>
            <TableCell>{m.category}</TableCell>
            <TableCell>
              <form action={approveMaterial.bind(null, m.id)}>
                <Button type="submit">Approve</Button>
              </form>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
