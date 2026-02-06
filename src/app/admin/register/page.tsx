"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db } from "@/db/client";
import { users } from "@/db/new-schema";
import { auth } from "@/lib/auth";

export default async function AdminRegisterPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in");

  // Since new-schema doesn't have role field, we'll skip admin check for now
  const alreadyAdmin = false;

  async function register(formData: FormData) {
    "use server";
    const innerSession = await auth.api.getSession({
      headers: await headers(),
    });
    if (!innerSession) throw new Error("Not authenticated");
    const secret = String(formData.get("secret") ?? "");
    const configured = process.env.ADMIN_REGISTRATION_SECRET;
    if (!configured) throw new Error("Admin registration not configured");
    if (secret !== configured) throw new Error("Invalid secret code");

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, innerSession.user.email));
    if (!existing) {
      await db.insert(users).values({
        id: crypto.randomUUID(),
        email: innerSession.user.email,
        name: innerSession.user.name ?? null,
      });
    }
    // Note: Since new-schema doesn't have role field, admin functionality
    // would need to be implemented differently (e.g., separate admin table)
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-xl font-semibold">Admin Registration</h1>
      {alreadyAdmin ? (
        <p className="text-sm text-gray-600">You are already an admin.</p>
      ) : (
        <form action={register} className="space-y-4">
          <div>
            <Label htmlFor="secret">Secret Code</Label>
            <Input id="secret" name="secret" type="password" required />
          </div>
          <Button type="submit">Become Admin</Button>
        </form>
      )}
    </div>
  );
}
