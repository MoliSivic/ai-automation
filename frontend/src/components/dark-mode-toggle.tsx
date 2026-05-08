"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/use-dark-mode";

export function DarkModeToggle({ className }: { className?: string }) {
  const { isDark, toggle } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className={className}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
      ) : (
        <Moon className="w-4 h-4 sm:w-5 sm:h-5" />
      )}
    </Button>
  );
}
