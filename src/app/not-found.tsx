import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center animate-fade-in">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-6">
          <Sparkles className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
        </div>

        <h1 className="font-display text-5xl sm:text-7xl font-bold gradient-text mb-2">
          404
        </h1>
        <h2 className="font-display text-xl sm:text-2xl font-semibold mb-2">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link href="/">
          <Button
            size="lg"
            className="gradient-bg text-primary-foreground h-11 sm:h-12 px-6 sm:px-8"
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
