import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MaterialCard } from "@/components/MaterialCard";
import { db } from "@/db/client";
import { auth } from "@/lib/auth";

export default async function MaterialsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) redirect("/auth/login");

  const materialList = await db.query.materials.findMany({
    where: (materials, { eq }) => eq(materials.approved, true),
  });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Material Library</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {materialList.map((m) => (
          <MaterialCard key={m.id} material={m} />
        ))}
      </div>
    </div>
  );
}
