"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle,
  Check,
  X,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/hooks/use-toast";

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

function getPasswordStrength(password: string) {
  let score = 0;
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  if (checks.length) score++;
  if (checks.lowercase) score++;
  if (checks.uppercase) score++;
  if (checks.number) score++;
  if (checks.special) score++;

  let label: string;
  let color: string;
  if (score <= 1) {
    label = "Very Weak";
    color = "bg-red-500";
  } else if (score === 2) {
    label = "Weak";
    color = "bg-orange-500";
  } else if (score === 3) {
    label = "Fair";
    color = "bg-yellow-500";
  } else if (score === 4) {
    label = "Strong";
    color = "bg-green-500";
  } else {
    label = "Very Strong";
    color = "bg-emerald-500";
  }

  return { score, checks, label, color };
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const signup = useAppStore((state) => state.signup);
  const resendConfirmationEmail = useAppStore(
    (state) => state.resendConfirmationEmail,
  );
  const router = useRouter();
  const { toast } = useToast();

  const passwordStrength = useMemo(
    () => getPasswordStrength(password),
    [password],
  );
  const passwordsMatch =
    confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (!agreedToTerms) {
      toast({
        title: "Terms required",
        description:
          "You must agree to the Terms of Service and Privacy Policy.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup(email, password, fullName);
      if (result.success && result.needsConfirmation) {
        setEmailSent(true);
        toast({
          title: "Check your email!",
          description:
            "We sent a confirmation link to verify your email address.",
        });
      } else if (result.success) {
        // Email confirmation disabled — user is immediately authenticated
        toast({
          title: "Account created!",
          description: "Welcome to FlashGenius.",
        });
        router.push("/dashboard");
      } else {
        toast({
          title: "Signup failed",
          description:
            result.error ||
            "An account with this email may already exist. Please try logging in.",
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

  const handleResendEmail = async () => {
    setIsLoading(true);
    const success = await resendConfirmationEmail(email);
    setIsLoading(false);

    if (success) {
      toast({
        title: "Email resent!",
        description: "Check your inbox for the confirmation link.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to resend email. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Email verification sent screen
  if (emailSent) {
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
            <div className="text-center py-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-bold mb-2">
                Verify your email
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base mb-1">
                We&apos;ve sent a confirmation link to
              </p>
              <p className="font-medium text-foreground mb-4">{email}</p>
              <p className="text-xs sm:text-sm text-muted-foreground mb-6">
                Click the link in the email to activate your account. If you
                don&apos;t see it, check your spam folder.
              </p>
              <div className="space-y-3">
                {IS_MOCK && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-2">
                    <p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
                      Mock Mode: No real email was sent. You can proceed to log
                      in directly.
                    </p>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleResendEmail}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Resend confirmation email"}
                </Button>
                <Link href="/login">
                  <Button
                    className="w-full gradient-bg text-primary-foreground font-semibold"
                    type="button"
                  >
                    Continue to log in
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Start your learning journey today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9 sm:pl-10 h-10 sm:h-11"
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm">
                Password
              </Label>
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

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          level <= passwordStrength.score
                            ? passwordStrength.color
                            : "bg-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-[10px] sm:text-xs ${
                      passwordStrength.score <= 2
                        ? "text-red-500"
                        : passwordStrength.score === 3
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {passwordStrength.label}
                  </p>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {[
                      { key: "length", label: "8+ characters" },
                      { key: "lowercase", label: "Lowercase" },
                      { key: "uppercase", label: "Uppercase" },
                      { key: "number", label: "Number" },
                      { key: "special", label: "Special char" },
                    ].map(({ key, label }) => (
                      <div
                        key={key}
                        className="flex items-center gap-1 text-[10px] sm:text-xs"
                      >
                        {passwordStrength.checks[
                          key as keyof typeof passwordStrength.checks
                        ] ? (
                          <Check className="w-3 h-3 text-green-500 shrink-0" />
                        ) : (
                          <X className="w-3 h-3 text-muted-foreground shrink-0" />
                        )}
                        <span
                          className={
                            passwordStrength.checks[
                              key as keyof typeof passwordStrength.checks
                            ]
                              ? "text-green-600 dark:text-green-400"
                              : "text-muted-foreground"
                          }
                        >
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`pl-9 sm:pl-10 pr-10 h-10 sm:h-11 ${
                    passwordsMismatch
                      ? "border-red-500 focus-visible:ring-red-500"
                      : passwordsMatch
                        ? "border-green-500 focus-visible:ring-green-500"
                        : ""
                  }`}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
              {passwordsMismatch && (
                <p className="text-[10px] sm:text-xs text-red-500">
                  Passwords do not match
                </p>
              )}
              {passwordsMatch && (
                <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Passwords match
                </p>
              )}
            </div>

            {/* Terms and Privacy */}
            <div className="flex items-start gap-2.5 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-border accent-primary cursor-pointer"
              />
              <label
                htmlFor="terms"
                className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-primary font-medium hover:underline"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full gradient-bg text-primary-foreground font-semibold py-5 sm:py-6"
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? "Creating account..." : "Create account"}
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </form>

          <div className="mt-5 sm:mt-6 text-center">
            <p className="text-muted-foreground text-xs sm:text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-primary font-medium hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
