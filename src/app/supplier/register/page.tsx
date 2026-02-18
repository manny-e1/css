"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { UserAgreement } from "@/components/auth/user-agreement";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { registerSupplierAction } from "./actions";

export default function SupplierRegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [certUrls, setCertUrls] = useState<string[]>([]);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    if (!agreed) {
      toast.error("Please agree to the User Agreement");
      setLoading(false);
      return;
    }

    const formData = new FormData(event.currentTarget);

    // Validate certification
    if (certUrls.length === 0) {
      toast.error("Please upload your registration/certification document");
      setLoading(false);
      return;
    }
    formData.set("certificationUrl", certUrls[0]);

    try {
      const result = await registerSupplierAction(formData);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          "Registration successful! Please check your email to verify your account.",
        );
        router.push("/auth/verify-email");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supplier Registration
          </h1>
          <p className="text-muted-foreground mt-2">
            Join our network of high-quality material suppliers. All
            registrations are subject to admin approval.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="Acme Materials Ltd."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tin">Tax Identification Number (TIN)</Label>
                <Input id="tin" name="tin" required placeholder="00-0000000" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="contact@acme.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  required
                  placeholder="+251 9..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Tell us about your company and the materials you supply..."
                className="h-32"
              />
            </div>

            <div className="space-y-2">
              <Label>Registration / Certification Document</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Please upload your business license or certification.
              </p>
              <ImageUpload
                value={certUrls}
                onChange={setCertUrls}
                onRemove={(url) =>
                  setCertUrls(certUrls.filter((c) => c !== url))
                }
              />
            </div>

            <UserAgreement
              type="supplier"
              checked={agreed}
              onCheckedChange={setAgreed}
            />
          </div>

          <div className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Register as Supplier
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/sign-in"
                className="underline underline-offset-4 hover:text-primary"
              >
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
