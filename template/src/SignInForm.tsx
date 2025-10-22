import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { LogIn, UserPlus, Loader2 } from "lucide-react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";

interface SignInFormProps {
  onSignIn: (userId: Id<"users">) => void;
  onForgotPassword?: () => void;
}

export function SignInForm({ onSignIn, onForgotPassword }: SignInFormProps) {
  const signUp = useMutation(api.simpleAuth.signUp);
  const signIn = useMutation(api.simpleAuth.signIn);

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (flow === "signUp") {
        const result = await signUp({ email, password });
        toast.success("Account created successfully!");
        onSignIn(result.userId as Id<"users">);
      } else {
        const result = await signIn({ email, password });
        toast.success("Welcome back!");
        onSignIn(result.userId as Id<"users">);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not complete request";
      toast.error(message);
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full shadow-2xl border-0 backdrop-blur-xl bg-white/95">
      <CardHeader className="space-y-2 text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-glow mb-2">
          {flow === "signIn" ? (
            <LogIn className="w-8 h-8 text-white" />
          ) : (
            <UserPlus className="w-8 h-8 text-white" />
          )}
        </div>
        <CardTitle className="text-3xl">
          {flow === "signIn" ? "Welcome Back" : "Create Account"}
        </CardTitle>
        <p className="text-secondary text-sm">
          {flow === "signIn"
            ? "Sign in to continue to your account"
            : "Sign up to get started"}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Email/Password form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-charcoal-900"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-semibold text-charcoal-900"
              >
                Password
              </label>
              {flow === "signIn" && onForgotPassword && (
                <button
                  type="button"
                  onClick={onForgotPassword}
                  disabled={submitting}
                  className="text-xs text-primary hover:text-primary-hover font-semibold transition-colors hover:underline disabled:opacity-50"
                >
                  Forgot Password?
                </button>
              )}
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
              minLength={6}
              disabled={submitting}
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {flow === "signIn" ? "Signing in..." : "Signing up..."}
                </span>
              </>
            ) : (
              <>
                {flow === "signIn" ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Sign Up</span>
                  </>
                )}
              </>
            )}
          </Button>

          <div className="text-center text-sm pt-2">
            <span className="text-secondary">
              {flow === "signIn"
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-primary hover:text-primary-hover font-semibold transition-colors hover:underline"
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              disabled={submitting}
            >
              {flow === "signIn" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
