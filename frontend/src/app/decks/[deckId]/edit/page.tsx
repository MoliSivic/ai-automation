"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/hooks/use-toast";

interface EditDeckPageProps {
  params: Promise<{ deckId: string }>;
}

export default function EditDeckPage({ params }: EditDeckPageProps) {
  const { deckId } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { decks, updateDeck } = useAppStore();

  const deck = decks.find((d) => d.id === deckId);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (deck) {
      setTitle(deck.title);
      setDescription(deck.description);
    } else if (deckId) {
      router.push("/dashboard");
    }
  }, [deck, deckId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your deck.",
        variant: "destructive",
      });
      return;
    }

    if (!deckId) return;

    setIsLoading(true);
    try {
      await updateDeck(deckId, title.trim(), description.trim());
      toast({
        title: "Deck updated!",
        description: "Your changes have been saved.",
      });
      router.push(`/decks/${deckId}`);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update deck. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!deck) {
    return null;
  }

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
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-2xl">
        <Link
          href={`/decks/${deckId}`}
          className="inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Deck
        </Link>

        <div className="bg-card rounded-xl p-5 sm:p-8 card-shadow-elevated">
          <h1 className="font-display text-xl sm:text-2xl font-bold mb-5 sm:mb-6">
            Edit Deck
          </h1>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm">
                Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="e.g., JavaScript Fundamentals"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
                className="h-10 sm:h-11"
                required
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {title.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                placeholder="What will you learn in this deck?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={4}
                className="resize-none"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                {description.length}/500 characters
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
              <Link
                href={`/decks/${deckId}`}
                className="flex-1 order-2 sm:order-1"
              >
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 sm:h-11"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                className="flex-1 order-1 sm:order-2 gradient-bg text-primary-foreground h-10 sm:h-11"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
