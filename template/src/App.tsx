import { Authenticated, Unauthenticated } from "convex/react";
import { Hero } from "./components/sections/Hero";
import { About } from "./components/sections/About";
import { Features } from "./components/sections/Features";
import { Contact } from "./components/sections/Contact";
import { Footer } from "./components/sections/Footer";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Optional Auth Header - only shows when authenticated */}
      <Authenticated>
        <header className="fixed top-4 right-4 z-50 animate-fade-in">
          <SignOutButton />
        </header>
      </Authenticated>

      {/* Main Landing Page Content */}
      <main>
        <Hero />
        <About />
        <Features />
        <Contact />
      </main>

      <Footer />

      {/* Auth Modal Overlay for Unauthenticated Users */}
      <Unauthenticated>
        <div className="fixed inset-0 bg-charcoal-900/50 backdrop-blur-sm z-40 flex items-center justify-center p-6 animate-fade-in">
          <div className="max-w-md w-full animate-scale-in">
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

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
