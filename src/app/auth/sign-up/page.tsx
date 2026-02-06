import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SignUpClient from "@/app/auth/sign-up/client";
import { auth } from "@/lib/auth";

export default async function SignUpPage() {
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

  return <SignUpClient />;
}
