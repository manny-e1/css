"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SignInClient() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });
      if (error) {
        if (error.message?.includes("banned")) {
          alert(
            "Your account is pending admin approval or has been suspended.",
          );
        } else {
          alert(error.message || "Sign-in failed");
        }
        return;
      }
      type User = typeof data.user & { role: string };

      if ((data.user as User).role === "supplier") {
        router.push("/supplier/dashboard");
      } else if ((data.user as User).role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/materials");
      }
    } catch (e) {
      console.error(e);
      alert("Sign-in failed");
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-xl font-semibold">Sign In</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit">Sign In</Button>
      </form>
      <p className="mt-4 text-sm text-center">
        No account?{" "}
        <a className="underline hover:text-primary" href="/auth/sign-up">
          Sign up
        </a>
      </p>
      <div className="mt-4 pt-4 border-t text-center">
        <p className="text-sm text-muted-foreground mb-2">
          Want to sell materials?
        </p>
        <Button variant="outline" className="w-full" asChild>
          <a href="/supplier/register">Register as Supplier</a>
        </Button>
      </div>
    </div>
  );
}
