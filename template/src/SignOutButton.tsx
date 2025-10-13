"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      className="group px-5 py-2.5 rounded-container bg-white/90 backdrop-blur-sm
                 text-secondary-dark border-2 border-gray-200 font-semibold
                 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700
                 transition-all duration-200 shadow-md hover:shadow-lg
                 transform hover:scale-105 active:scale-95
                 flex items-center gap-2"
      onClick={() => void signOut()}
    >
      <svg
        className="w-4 h-4 transition-transform group-hover:rotate-12"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
        />
      </svg>
      <span>Sign out</span>
    </button>
  );
}
