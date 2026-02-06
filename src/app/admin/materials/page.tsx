"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import {
  approveMaterialSubmissionAction,
  listMaterialSubmissionsAction,
  rejectMaterialSubmissionAction,
} from "./actions";

export default async function AdminMaterialsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  const items = await listMaterialSubmissionsAction();

  async function approve(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await approveMaterialSubmissionAction(id);
  }

  async function reject(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    const note = String(formData.get("note") ?? "");
    await rejectMaterialSubmissionAction(id, note);
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-4 text-xl font-semibold">
        Pending Material Submissions
      </h1>

      <ul className="space-y-3">
        {items.map((m) => (
          <li key={m.id} className="rounded-md border p-3">
            <div className="font-medium">
              {m.name} • {m.category}
            </div>
            <div className="text-sm text-gray-600">
              Supplier: {m.supplierName} • Origin: {m.origin}
            </div>
            <div className="text-sm text-gray-600">
              Price: {m.unitPriceRange} • EC: {m.embodiedCarbonFactor}
            </div>
            <div className="mt-2 flex gap-2">
              <form action={approve}>
                <input type="hidden" name="id" value={m.id} />
                <Button type="submit">Approve</Button>
              </form>
              <form action={reject} className="flex gap-2">
                <input type="hidden" name="id" value={m.id} />
                <input
                  className="rounded-md border px-2 py-1 text-sm"
                  name="note"
                  placeholder="Reason (optional)"
                />
                <Button type="submit" variant="destructive">
                  Reject
                </Button>
              </form>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-gray-600">No pending submissions.</li>
        )}
      </ul>
    </div>
  );
}
