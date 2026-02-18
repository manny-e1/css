import { Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 rounded-full p-4">
              <Mail className="h-12 w-12 text-white" />
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Check Your Email
        </h1>

        <p className="text-gray-600 mb-6 leading-relaxed">
          We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-left text-sm text-gray-700">
              <p className="font-medium mb-1">What's next?</p>
              <ul className="space-y-1 text-gray-600">
                <li>• Check your email inbox (and spam folder)</li>
                <li>• Click the verification link</li>
                <li>• You'll be redirected to sign in</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Didn't receive the email?
          </p>
          <p className="text-xs text-gray-400">
            Please wait a few minutes and check your spam folder. If you still don't see it, you can try signing up again.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link href="/auth/sign-in">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

