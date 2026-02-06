import { headers } from "next/headers";
import { MaterialTable } from "@/components/MaterialTable";
import { db } from "@/db/client";
import { auth } from "@/lib/auth";

export default async function AdminMaterials() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <p>Access Denied</p>;
  }

  const pendingMaterials = await db.query.materials.findMany({
    where: (materials, { eq }) => eq(materials.approved, false),
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin: Pending Materials</h1>
      <MaterialTable materials={pendingMaterials} />
      {/* Add approve button logic in table */}
    </div>
  );
}
