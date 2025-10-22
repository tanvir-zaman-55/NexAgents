import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";

interface VerificationBannerProps {
  userId: Id<"users">;
  onVerifyClick: () => void;
}

export function VerificationBanner({ userId, onVerifyClick }: VerificationBannerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const requestVerification = useAction(api.simpleAuth.requestEmailVerification);

  const handleSendCode = async () => {
    setIsLoading(true);

    try {
      await requestVerification({ userId });
      toast.success("Verification code sent! Check your email.");
      // Automatically navigate to verification page
      setTimeout(() => onVerifyClick(), 1000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border-b border-yellow-200">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="flex items-center flex-1">
            <svg
              className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                <span className="hidden sm:inline">Your email address is not verified. </span>
                Please verify your email to access all features.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <button
              onClick={handleSendCode}
              disabled={isLoading}
              className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Verify Now"}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-2 text-yellow-600 hover:text-yellow-800 transition-colors"
              aria-label="Dismiss banner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
