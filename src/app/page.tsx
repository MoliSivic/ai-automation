"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  BookOpen,
  Brain,
  Zap,
  ArrowRight,
  CheckCircle,
  Menu,
  X,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";

const features = [
  {
    icon: BookOpen,
    title: "Create Custom Decks",
    description:
      "Organize your knowledge into themed decks for focused learning",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description: "Paste your notes and let AI create flashcards instantly",
  },
  {
    icon: Brain,
    title: "Smart Study Mode",
    description: "Flip, review, and track your progress with interactive cards",
  },
  {
    icon: Zap,
    title: "Learn Faster",
    description: "Scientifically designed to boost memory retention",
  },
];

const benefits = [
  "Create unlimited flashcard decks",
  "AI generates cards from your notes",
  "Track your study progress",
  "Beautiful, distraction-free interface",
  "Works on any device",
];

export default function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl">
              FlashGenius
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="font-medium">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="gradient-bg text-primary-foreground font-medium shadow-glow">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="sm:hidden p-2 -mr-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="sm:hidden bg-background border-b border-border animate-fade-in">
            <div className="container px-4 py-4 space-y-3">
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full gradient-bg text-primary-foreground font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Background decoration - hidden on mobile for performance */}
        <div className="absolute inset-0 -z-10 hidden sm:block">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6 animate-fade-in">
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            AI-Powered Learning
          </div>

          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in leading-tight">
            Master Anything with{" "}
            <span className="gradient-text">Smart Flashcards</span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto animate-fade-in px-2">
            Create, study, and ace your exams with AI-generated flashcards.
            Transform your notes into powerful study tools in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto gradient-bg text-primary-foreground font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-glow hover:scale-105 transition-transform"
              >
                Start Learning Free
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </Link>
            <Link href="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto font-semibold text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6"
              >
                I have an account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Everything You Need to Learn
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-2">
              Powerful features designed to make studying effective and
              enjoyable
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-5 sm:p-6 card-shadow-elevated hover:shadow-glow transition-all duration-300 hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg gradient-bg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-base sm:text-lg mb-1.5 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
                Study Smarter, Not Harder
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
                Our intelligent flashcard system adapts to how you learn. Create
                decks manually or let AI do the heavy lifting by extracting key
                concepts from your study materials.
              </p>
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {benefits.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-center gap-3 text-sm sm:text-base"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-success flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="gradient-bg text-primary-foreground font-semibold w-full sm:w-auto">
                  Get Started Now
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Flashcard Preview */}
            <div className="relative order-1 lg:order-2">
              <div className="flashcard-container mx-auto max-w-sm sm:max-w-md">
                <div className="relative">
                  {/* Stacked cards effect - simplified on mobile */}
                  <div className="absolute inset-0 bg-card rounded-2xl card-shadow rotate-3 translate-y-2 hidden sm:block" />
                  <div className="absolute inset-0 bg-card rounded-2xl card-shadow -rotate-2 translate-y-1 hidden sm:block" />

                  {/* Main card */}
                  <div className="relative bg-card rounded-2xl p-6 sm:p-8 card-shadow-elevated gradient-border min-h-[220px] sm:min-h-[280px] flex flex-col justify-center animate-float">
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4 text-xs text-muted-foreground font-medium">
                      1 / 5
                    </div>
                    <div className="text-center">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                        Question
                      </p>
                      <h3 className="font-display text-lg sm:text-xl md:text-2xl font-semibold">
                        What is a closure in JavaScript?
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-6">
                        Tap to flip
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="gradient-bg rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center text-primary-foreground relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10" />
            <div className="relative">
              <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                Ready to Supercharge Your Learning?
              </h2>
              <p className="text-primary-foreground/80 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join thousands of students who are already learning smarter with
                FlashGenius
              </p>
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="font-semibold text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-12 px-4 sm:px-6 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg sm:text-xl">
                FlashGenius
              </span>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm">
              © 2024 FlashGenius. Built for learners everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
