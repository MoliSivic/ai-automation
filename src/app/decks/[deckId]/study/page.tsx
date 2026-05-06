"use client";

import { useState, useMemo, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Check,
  X,
  RotateCcw,
  Trophy,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { Progress } from "@/components/ui/progress";

interface StudyModePageProps {
  params: Promise<{ deckId: string }>;
}

export default function StudyModePage({ params }: StudyModePageProps) {
  const { deckId } = use(params);
  const { decks, cards, settings, createStudySession } = useAppStore();

  const deck = decks.find((d) => d.id === deckId);
  const deckCards = deckId ? cards[deckId] || [] : [];

  const studyCards = useMemo(() => {
    if (settings.shuffle_enabled) {
      return [...deckCards].sort(() => Math.random() - 0.5);
    }
    return deckCards;
  }, [deckCards, settings.shuffle_enabled]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());
  const [unknownCards, setUnknownCards] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);

  if (!deck || studyCards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            {!deck ? "Deck not found" : "No cards to study"}
          </h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentCard = studyCards[currentIndex];
  const totalCards = studyCards.length;
  const answeredCards = knownCards.size + unknownCards.size;
  const progress = (answeredCards / totalCards) * 100;

  const handleKnow = () => {
    setKnownCards((prev) => new Set([...prev, currentCard.id]));
    goToNext();
  };

  const handleDontKnow = () => {
    setUnknownCards((prev) => new Set([...prev, currentCard.id]));
    goToNext();
  };

  const goToNext = () => {
    setIsFlipped(false);
    if (currentIndex < totalCards - 1) {
      setTimeout(() => setCurrentIndex((prev) => prev + 1), 200);
    } else {
      createStudySession(deck.id, knownCards.size + 1, totalCards);
      setIsComplete(true);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const restartStudy = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnownCards(new Set());
    setUnknownCards(new Set());
    setIsComplete(false);
  };

  if (isComplete) {
    const percentage = Math.round((knownCards.size / totalCards) * 100);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-sm sm:max-w-md w-full text-center animate-scale-in">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-2">
            Session Complete!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mb-6 sm:mb-8">
            Great job studying {deck.title}
          </p>

          <div className="bg-card rounded-2xl p-5 sm:p-6 card-shadow-elevated mb-6 sm:mb-8">
            <div className="text-4xl sm:text-5xl font-display font-bold gradient-text mb-2">
              {percentage}%
            </div>
            <p className="text-muted-foreground text-sm sm:text-base">
              Cards you knew
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-success">
                  {knownCards.size}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Known
                </p>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold text-destructive">
                  {unknownCards.size}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Need Review
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={restartStudy}
              className="flex-1 h-11 sm:h-12"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button className="w-full h-11 sm:h-12 gradient-bg text-primary-foreground">
                Done
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <header className="flex-shrink-0 border-b border-border bg-background/80 backdrop-blur-md z-10">
        <div className="container mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link
            href={`/decks/${deckId}`}
            className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Exit</span>
          </Link>

          <div className="flex-1 max-w-[200px] sm:max-w-xs mx-4">
            <div className="text-center mb-1 text-xs sm:text-sm font-medium">
              {currentIndex + 1} / {totalCards}
            </div>
            <Progress value={progress} className="h-1.5 sm:h-2" />
          </div>

          <div className="w-12 sm:w-20" />
        </div>
      </header>

      <div className="flex-1 flex flex-col min-h-0">
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div className="w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrev}
                disabled={currentIndex === 0}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <span className="text-xs sm:text-sm text-muted-foreground truncate px-2 max-w-[200px] sm:max-w-none">
                {deck.title}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                disabled={currentIndex === totalCards - 1}
                className="h-8 w-8 sm:h-10 sm:w-10"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>

            <div
              className="flashcard-container cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div
                className={`flashcard ${isFlipped ? "flipped" : ""}`}
                style={{ height: "clamp(250px, 40vh, 400px)" }}
              >
                <div className="flashcard-face absolute inset-0 bg-card rounded-2xl p-5 sm:p-8 card-shadow-elevated gradient-border flex flex-col justify-center">
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-[10px] sm:text-xs text-muted-foreground font-medium px-2 py-1 bg-muted rounded">
                    Question
                  </div>
                  <div className="text-center px-4 overflow-y-auto max-h-[60%]">
                    <p className="font-display text-lg sm:text-xl md:text-2xl font-semibold leading-relaxed">
                      {currentCard.front_text}
                    </p>
                  </div>
                  <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 text-center text-[10px] sm:text-sm text-muted-foreground">
                    Tap to flip
                  </div>
                </div>

                <div className="flashcard-face flashcard-back absolute inset-0 bg-card rounded-2xl p-5 sm:p-8 card-shadow-elevated flex flex-col justify-center">
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4 text-[10px] sm:text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                    Answer
                  </div>
                  <div className="text-center px-4 overflow-y-auto max-h-[70%]">
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed">
                      {currentCard.back_text}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="flex-shrink-0 bg-background border-t border-border p-4 sm:p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                variant="outline"
                className="flex-1 max-w-[160px] sm:max-w-[180px] h-12 sm:h-14 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground text-sm sm:text-base font-medium"
                onClick={handleDontKnow}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Don&apos;t Know
              </Button>
              <Button
                size="lg"
                className="flex-1 max-w-[160px] sm:max-w-[180px] h-12 sm:h-14 bg-success text-success-foreground hover:bg-success/90 text-sm sm:text-base font-medium"
                onClick={handleKnow}
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Know
              </Button>
            </div>

            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-3">
              Click the card to flip, then rate your knowledge
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
