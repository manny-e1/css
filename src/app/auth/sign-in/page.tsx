import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignInClient from "./client";

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    // Redirect based on role
    const userRole = session.user.role;
    switch (userRole) {
      case "admin":
        redirect("/admin/users");
        break;
      case "professional":
        redirect("/materials");
        break;
      case "supplier":
        redirect("/supplier/dashboard");
        break;
      default:
        redirect("/projects");
    }
  }

  return <SignInClient />;
}
