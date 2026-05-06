"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const login = useAppStore((state) => state.login);
  const resendConfirmationEmail = useAppStore(
    (state) => state.resendConfirmationEmail,
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Show error from auth callback redirect
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      toast({
        title: "Authentication error",
        description: error,
        variant: "destructive",
      });
      // Clean up the URL
      router.replace("/login");
    }
  }, [searchParams, toast, router]);

  const handleResendVerification = async () => {
    if (!unconfirmedEmail) return;
    setIsResending(true);
    try {
      await resendConfirmationEmail(unconfirmedEmail);
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and verify your email.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to resend verification email.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUnconfirmedEmail(null);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        router.push("/dashboard");
      } else if (result.error === "email_not_confirmed") {
        setUnconfirmedEmail(email);
        toast({
          title: "Email not verified",
          description:
            "Please verify your email before logging in. Check your inbox for the verification link.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login failed",
          description:
            result.error || "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-muted/30">
      <div className="fixed inset-0 -z-10 hidden sm:block">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 mb-6 sm:mb-8"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl sm:text-2xl">
            FlashGenius
          </span>
        </Link>

        <div className="bg-card rounded-2xl p-5 sm:p-8 card-shadow-elevated">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="font-display text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Log in to continue your learning journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {unconfirmedEmail && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-3 sm:p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-2">
                  Your email hasn&apos;t been verified yet. Please check your
                  inbox for the verification link.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendVerification}
                  disabled={isResending}
                  className="text-xs"
                >
                  {isResending ? "Sending..." : "Resend verification email"}
                </Button>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 sm:pl-10 h-10 sm:h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 sm:pl-10 pr-10 h-10 sm:h-11"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gradient-bg text-primary-foreground font-semibold py-5 sm:py-6"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log in"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-muted-foreground text-xs sm:text-sm">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-primary font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
