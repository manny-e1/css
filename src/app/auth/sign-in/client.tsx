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
      await authClient.signIn.email({
        email,
        password,
      });
      router.push("/materials");
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
      <p className="mt-4 text-sm">
        No account?{" "}
        <a className="underline" href="/auth/sign-up">
          Sign up
        </a>
      </p>
    </div>
  );
}
