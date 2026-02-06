import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export default async function Dashboard() {
  const session = await auth.api.getSession({
    headers: await headers(),
  }); // Better Auth way
  console.log(session);
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <h1>Welcome {session.user.email}</h1>
      <h1 className="text-3xl font-bold mb-6">
        Welcome to Carbon Smart Spaces Dashboard
      </h1>
      <p>Navigate to Materials, Compare, or Projects.</p>
    </div>
  );
}
