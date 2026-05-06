"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Sparkles,
  User,
  Palette,
  BookOpen,
  Wand2,
  LogOut,
  Save,
  Moon,
  Sun,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/hooks/use-toast";
import { ThemeName } from "@/lib/mockData";
import { useDarkMode } from "@/hooks/use-dark-mode";

const themes: { value: ThemeName; label: string; colors: string[] }[] = [
  {
    value: "ocean",
    label: "Ocean",
    colors: ["#0ea5e9", "#06b6d4"],
  },
  {
    value: "sunset",
    label: "Sunset",
    colors: ["#f59e0b", "#ef4444"],
  },
  {
    value: "forest",
    label: "Forest",
    colors: ["#10b981", "#059669"],
  },
  {
    value: "lavender",
    label: "Lavender",
    colors: ["#a855f7", "#7c3aed"],
  },
  {
    value: "midnight",
    label: "Midnight",
    colors: ["#6366f1", "#4f46e5"],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, settings, updateSettings, logout } = useAppStore();

  const [name, setName] = useState(user?.name || "");
  const [shuffleEnabled, setShuffleEnabled] = useState(
    settings.shuffle_enabled,
  );
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(settings.theme);
  const [aiModel, setAiModel] = useState(settings.ai_model);
  const { isDark, setDark } = useDarkMode();

  const handleSave = async () => {
    await updateSettings({
      shuffle_enabled: shuffleEnabled,
      theme: selectedTheme,
      ai_model: aiModel,
    });

    document.documentElement.setAttribute("data-theme", selectedTheme);

    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    });
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg gradient-bg flex items-center justify-center">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg sm:text-xl">
              FlashGenius
            </span>
          </Link>
          <button
            onClick={() => setDark(!isDark)}
            className="p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="font-display text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">
          Settings
        </h1>

        <div className="space-y-5 sm:space-y-6">
          <div className="bg-card rounded-xl p-5 sm:p-6 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full gradient-bg flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-semibold">
                Profile
              </h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm">
                  Display Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="h-10 sm:h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="h-10 sm:h-11 opacity-60"
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 sm:p-6 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-semibold">
                Appearance
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Dark Mode</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Switch between light and dark appearance
                  </p>
                </div>
                <Switch checked={isDark} onCheckedChange={setDark} />
              </div>

              <div className="space-y-3">
                <Label className="text-sm">Color Theme</Label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => setSelectedTheme(theme.value)}
                      className={`relative flex flex-col items-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                        selectedTheme === theme.value
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <div
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mb-1 sm:mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
                        }}
                      />
                      <span className="text-[10px] sm:text-xs font-medium">
                        {theme.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 sm:p-6 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-semibold">
                Study Preferences
              </h2>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">Shuffle Cards</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Randomize card order during study
                  </p>
                </div>
                <Switch
                  checked={shuffleEnabled}
                  onCheckedChange={setShuffleEnabled}
                />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl p-5 sm:p-6 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h2 className="font-display text-lg sm:text-xl font-semibold">
                AI Generation
              </h2>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Default AI Model</Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger className="h-10 sm:h-11">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-2.5-flash-lite">
                    Gemini 2.5 Flash Lite (Free)
                  </SelectItem>
                  <SelectItem value="gemma-3-4b-it">
                    Gemma 3 4B (Free, lightweight)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                AI model used for generating flashcards
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleSave}
              className="flex-1 gradient-bg text-primary-foreground h-11 sm:h-12"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex-1 h-11 sm:h-12 text-destructive hover:text-destructive border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
