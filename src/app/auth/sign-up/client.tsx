"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { updateUserRole } from "@/app/actions/update-user-role";
import { UserAgreement } from "@/components/auth/user-agreement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import type { Role } from "@/lib/roles";

export default function SignUpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const requestedRole = searchParams.get("role") as Role | null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) {
      alert("Please agree to the User Agreement");
      return;
    }
    setIsSubmitting(true);
    try {
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        throw new Error(error.message || "Sign-up failed");
      }
      // If a specific role was requested (e.g., supplier), update it after signup
      if (data?.user?.id && requestedRole === "supplier") {
        await updateUserRole(data.user.id, "supplier");
      }

      // Redirect to verify email page since email verification is now required
      router.push("/auth/verify-email");
      router.refresh();
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "Sign-up failed";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm p-6">
      <h1 className="mb-4 text-xl font-semibold">
        {requestedRole === "supplier" ? "Supplier Sign Up" : "Sign Up"}
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
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
        <UserAgreement
          type={requestedRole === "supplier" ? "supplier" : "buyer"}
          checked={agreed}
          onCheckedChange={setAgreed}
        />
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting
            ? "Creating Account..."
            : requestedRole === "supplier"
              ? "Register as Supplier"
              : "Create Account"}
        </Button>
      </form>
      <p className="mt-4 text-sm">
        Already have an account?{" "}
        <a className="underline" href="/auth/sign-in">
          Sign in
        </a>
      </p>
    </div>
  );
}
