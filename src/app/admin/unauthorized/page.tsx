import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminUnauthorizedPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-8">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Admin Access Required</CardTitle>
          <CardDescription>
            You need administrator privileges to access this area.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Only system administrators can access this page. If you need admin
            access, please contact the system owner.
          </p>
          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
            <Link href="/auth/sign-in" className="flex-1">
              <Button className="w-full">Login as Admin</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
