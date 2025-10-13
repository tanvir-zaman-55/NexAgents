import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated gradient background blobs */}
      <div className="gradient-blob gradient-blob-1" />
      <div className="gradient-blob gradient-blob-2" />
      <div className="gradient-blob gradient-blob-3" />

      {/* Modern glassmorphism header */}
      <header className="sticky top-0 z-10 glass-card h-16 flex justify-between items-center px-6 animate-slide-down">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <h2 className="text-xl font-bold text-gradient">Chef</h2>
        </div>
        <SignOutButton />
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md mx-auto animate-fade-in">
          <Content />
        </div>
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-200"></div>
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Hero section with modern card */}
      <div className="glass-card rounded-2xl p-8 text-center animate-scale-in shadow-xl">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary via-accent to-primary-700 rounded-2xl shadow-glow mb-4 animate-float">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold text-gradient mb-3">
            Cook with Chef
          </h1>
          <Authenticated>
            <p className="text-xl text-secondary-dark font-medium">
              Welcome back, <span className="text-primary font-semibold">{loggedInUser?.email ?? "friend"}</span>! ✨
            </p>
          </Authenticated>
          <Unauthenticated>
            <p className="text-lg text-secondary">
              Sign in to start building amazing things
            </p>
          </Unauthenticated>
        </div>

        {/* Feature badges for authenticated users */}
        <Authenticated>
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
              Real-time Database
            </span>
            <span className="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold">
              File Storage
            </span>
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
              Authentication
            </span>
          </div>
        </Authenticated>
      </div>

      {/* Sign in form for unauthenticated users */}
      <Unauthenticated>
        <div className="animate-slide-up">
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
