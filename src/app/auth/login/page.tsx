// app/(auth)/login/page.tsx (Similar to register)
"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Login() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Login</h1>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          signIn("credentials", {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            callbackUrl: "/dashboard",
          });
        }}
      >
        <Input name="email" type="email" placeholder="Email" />
        <Input name="password" type="password" placeholder="Password" />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
