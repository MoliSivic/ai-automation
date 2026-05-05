"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  ArrowLeft,
  Wand2,
  Loader2,
  Trash2,
  RefreshCw,
  Save,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/hooks/use-toast";
import { generateMockCards } from "@/lib/mockData";

interface GeneratedCard {
  front_text: string;
  back_text: string;
  position: number;
}

export default function AIGeneratePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { settings, createDeck, addCardsFromAI } = useAppStore();

  const [deckTitle, setDeckTitle] = useState("");
  const [studyText, setStudyText] = useState("");
  const [cardCount, setCardCount] = useState([
    settings.default_ai_card_count || 10,
  ]);
  const [style, setStyle] = useState(settings.default_ai_style || "concise");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCards, setGeneratedCards] = useState<GeneratedCard[]>([]);
  const [step, setStep] = useState<"input" | "review">("input");

  const handleGenerate = async () => {
    if (!studyText.trim()) {
      toast({
        title: "Content required",
        description: "Please paste some study material to generate flashcards.",
        variant: "destructive",
      });
      return;
    }

    if (!deckTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your deck.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const cards = generateMockCards(studyText, cardCount[0]);
    setGeneratedCards(cards);
    setStep("review");
    setIsGenerating(false);

    toast({
      title: "Cards generated!",
      description: `${cards.length} flashcards created. Review and edit before saving.`,
    });
  };

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const cards = generateMockCards(studyText, cardCount[0]);
    setGeneratedCards(cards);
    setIsGenerating(false);
    toast({ title: "Cards regenerated!" });
  };

  const handleRemoveCard = (index: number) => {
    setGeneratedCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpdateCard = (
    index: number,
    field: "front_text" | "back_text",
    value: string,
  ) => {
    setGeneratedCards((prev) =>
      prev.map((card, i) => (i === index ? { ...card, [field]: value } : card)),
    );
  };

  const handleSave = () => {
    if (generatedCards.length === 0) {
      toast({
        title: "No cards to save",
        description: "Generate some cards first.",
        variant: "destructive",
      });
      return;
    }

    const newDeck = createDeck(deckTitle.trim(), "AI-generated flashcard deck");
    addCardsFromAI(newDeck.id, generatedCards);

    toast({
      title: "Deck created!",
      description: `${generatedCards.length} flashcards saved to ${deckTitle}.`,
    });
    router.push(`/decks/${newDeck.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
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

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-4xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {step === "input" ? (
          <div className="bg-card rounded-xl p-5 sm:p-8 card-shadow-elevated">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
                <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl sm:text-2xl font-bold">
                  AI Generate Flashcards
                </h1>
                <p className="text-muted-foreground text-xs sm:text-sm truncate">
                  Paste your study notes and let AI create flashcards
                </p>
              </div>
            </div>

            <div className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <Label htmlFor="deckTitle" className="text-sm">
                  Deck Title *
                </Label>
                <Input
                  id="deckTitle"
                  placeholder="e.g., Biology Chapter 5"
                  value={deckTitle}
                  onChange={(e) => setDeckTitle(e.target.value)}
                  maxLength={100}
                  className="h-10 sm:h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studyText" className="text-sm">
                  Study Material *
                </Label>
                <Textarea
                  id="studyText"
                  placeholder="Paste your study notes, textbook content, or any material you want to learn..."
                  value={studyText}
                  onChange={(e) => setStudyText(e.target.value)}
                  rows={8}
                  className="resize-none text-sm sm:text-base"
                />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {studyText.length} characters
                </p>
              </div>

              <div className="grid gap-5 sm:gap-6 sm:grid-cols-2">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Number of Cards</Label>
                    <span className="text-sm font-medium">{cardCount[0]}</span>
                  </div>
                  <Slider
                    value={cardCount}
                    onValueChange={setCardCount}
                    min={1}
                    max={30}
                    step={1}
                    className="py-2"
                  />
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    Generate between 1 and 30 flashcards
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Card Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-background h-10 sm:h-11">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="concise">Concise</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="simple">Simple</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full gradient-bg text-primary-foreground py-5 sm:py-6 text-base sm:text-lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Generate Flashcards
                  </>
                )}
              </Button>

              <p className="text-[10px] sm:text-xs text-center text-muted-foreground">
                Note: This demo uses mock data. In production, this would
                connect to the Gemini API.
              </p>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex flex-col gap-4 mb-5 sm:mb-6">
              <div>
                <h1 className="font-display text-xl sm:text-2xl font-bold">
                  Review Generated Cards
                </h1>
                <p className="text-muted-foreground text-sm">
                  {generatedCards.length} cards for &quot;{deckTitle}&quot;
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  size="sm"
                  className="h-9 flex-1 sm:flex-none"
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-1.5 ${isGenerating ? "animate-spin" : ""}`}
                  />
                  <span className="hidden xs:inline">Regenerate</span>
                  <span className="xs:hidden">Redo</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("input")}
                  size="sm"
                  className="h-9 flex-1 sm:flex-none"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  Back
                </Button>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              {generatedCards.map((card, index) => (
                <div
                  key={index}
                  className="bg-card rounded-xl p-3 sm:p-4 card-shadow hover:card-shadow-elevated transition-shadow"
                >
                  <div className="flex items-start justify-between gap-2 mb-2 sm:mb-3">
                    <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                      Card {index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive h-6 w-6 sm:h-7 sm:w-7"
                      onClick={() => handleRemoveCard(index)}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">
                        Front (Question)
                      </Label>
                      <Textarea
                        value={card.front_text}
                        onChange={(e) =>
                          handleUpdateCard(index, "front_text", e.target.value)
                        }
                        rows={2}
                        className="resize-none text-xs sm:text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] sm:text-xs">
                        Back (Answer)
                      </Label>
                      <Textarea
                        value={card.back_text}
                        onChange={(e) =>
                          handleUpdateCard(index, "back_text", e.target.value)
                        }
                        rows={2}
                        className="resize-none text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {generatedCards.length > 0 && (
              <Button
                onClick={handleSave}
                className="w-full gradient-bg text-primary-foreground py-5 sm:py-6 text-base sm:text-lg"
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Save {generatedCards.length} Cards to Deck
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
