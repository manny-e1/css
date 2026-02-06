import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";

export default async function UnauthorizedPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // If not logged in, redirect to sign in
  if (!session) {
    redirect("/auth/sign-in");
  }

  const getRoleBasedRedirect = () => {
    switch (session.user.role) {
      case "admin":
        return "/admin/users";
      case "professional":
        return "/professional/dashboard";
      case "supplier":
        return "/supplier/dashboard";
      default:
        return "/";
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6 min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-lg text-gray-700">
            You don't have permission to access this page.
          </p>
          <p className="text-sm text-gray-600">
            Your role:{" "}
            <span className="font-semibold capitalize">
              {session.user.role}
            </span>
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Link href={getRoleBasedRedirect()}>
              <Button>Go to Dashboard</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Go to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
