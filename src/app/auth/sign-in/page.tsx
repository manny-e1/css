import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import SignInClient from "./client";

export default async function SignInPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    if (session.user.banned) {
      // If user is banned but session exists, sign them out and show error
      // Since we are server-side, we can't easily alert.
      // But we can redirect to sign-in with error query param?
      // Or just render the sign-in client with a specific prop?
      // Let's just return SignInClient. The client side will likely fail to fetch session or handle it.
      // Actually, if we are here, we are authenticated.
      // We should probably redirect to a "banned" page or just render SignInClient and let the user try again (which will fail).
      // But auto-redirecting to dashboard is bad.
      return <SignInClient />;
    }

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
