import { CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EmailVerifiedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-4">
              <CheckCircle2 className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
          Email Verified!
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          Your email has been successfully verified. You can now sign in to your account and start using our platform.
        </p>

        <Link href="/auth/sign-in">
          <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white">
            Continue to Sign In
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? <Link href="/support" className="text-green-600 hover:underline">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

