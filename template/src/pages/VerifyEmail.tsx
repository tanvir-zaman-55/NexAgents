import { useState, useEffect } from "react";
import { useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { OTPInput } from "../components/auth/OTPInput";
import { toast } from "sonner";
import type { Id } from "../../convex/_generated/dataModel";

interface VerifyEmailProps {
  userId: Id<"users">;
  email: string;
  onVerified: () => void;
}

export function VerifyEmail({ userId, email, onVerified }: VerifyEmailProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const verifyEmail = useMutation(api.simpleAuth.verifyEmail);
  const requestVerification = useAction(api.simpleAuth.requestEmailVerification);

  // Start cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleOTPComplete = async (code: string) => {
    setIsVerifying(true);

    try {
      await verifyEmail({ userId, code });
      toast.success("Email verified successfully!");
      onVerified();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid or expired code");
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      await requestVerification({ userId });
      toast.success("Verification code sent! Check your email.");
      setResendCooldown(60); // 60 second cooldown
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send code");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md border border-gray-200 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We sent a verification code to
            <br />
            <span className="font-medium text-gray-900">{email}</span>
          </p>
        </div>

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter Verification Code
          </label>
          <OTPInput onComplete={handleOTPComplete} disabled={isVerifying} />
        </div>

        {/* Resend Code */}
        <div className="text-center">
          <button
            onClick={handleResendCode}
            disabled={resendCooldown > 0}
            className="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
          >
            {resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Didn't receive the code? Resend"}
          </button>
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Check your spam folder</p>
              <p>The code expires in 15 minutes. Make sure to check your spam or junk folder if you don't see it.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
