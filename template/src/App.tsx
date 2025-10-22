import { useState, useEffect } from "react";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Features } from "./components/sections/Features";
import { Contact } from "./components/sections/Contact";
import { Footer } from "./components/sections/Footer";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { AdminDashboard } from "./pages/AdminDashboard";
import { UserDashboard } from "./pages/UserDashboard";
import { Toaster } from "sonner";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

export default function App() {
  const [userId, setUserId] = useState<Id<"users"> | null>(null);

  // Load user ID from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) {
      setUserId(savedUserId as Id<"users">);
    }
  }, []);

  // Get current user data
  const currentUser = useQuery(
    api.simpleAuth.getUser,
    userId ? { userId } : "skip"
  );

  const handleSignIn = (newUserId: Id<"users">) => {
    setUserId(newUserId);
    localStorage.setItem("userId", newUserId);
  };

  const handleSignOut = () => {
    setUserId(null);
    localStorage.removeItem("userId");
  };

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.role === "admin";

  return (
    <div className="min-h-screen">
      {/* Auth Header - shows when authenticated */}
      {isAuthenticated && (
        <header className="fixed top-4 right-4 z-50 animate-fade-in">
          <SignOutButton onSignOut={handleSignOut} userName={currentUser?.name} />
        </header>
      )}

      {/* Render dashboard for authenticated users, landing page otherwise */}
      {isAuthenticated ? (
        <>
          {isAdmin ? (
            <AdminDashboard />
          ) : (
            <UserDashboard userName={currentUser?.name || "User"} />
          )}
        </>
      ) : (
        <>
          {/* Landing Page Content */}
          <main>
            <Hero />
            <About />
            <Features />
            <Contact />
          </main>

          <Footer />

          {/* Auth Modal Overlay for Unauthenticated Users */}
          <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-6 animate-fade-in">
            <div className="max-w-md w-full animate-scale-in">
              <SignInForm onSignIn={handleSignIn} />
            </div>
          </div>
        </>
      )}

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(139, 92, 246, 0.1)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          },
        }}
      />
    </div>
  );
}
