"use client";

import { useState, use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sparkles,
  ArrowLeft,
  Plus,
  Edit3,
  Trash2,
  Play,
  BookOpen,
  Save,
  X,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface DeckDetailPageProps {
  params: Promise<{ deckId: string }>;
}

export default function DeckDetailPage({ params }: DeckDetailPageProps) {
  const { deckId } = use(params);
  const { toast } = useToast();
  const { decks, cards, addCard, updateCard, deleteCard } = useAppStore();
  const isMobile = useIsMobile();

  const deck = decks.find((d) => d.id === deckId);
  const deckCards = deckId ? cards[deckId] || [] : [];

  const [isAddingCard, setIsAddingCard] = useState(false);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");

  if (!deck) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-lg sm:text-xl font-semibold mb-2">
            Deck not found
          </h2>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddCard = () => {
    if (!frontText.trim() || !backText.trim()) {
      toast({
        title: "Both sides required",
        description: "Please fill in both the front and back of the card.",
        variant: "destructive",
      });
      return;
    }

    addCard(deck.id, frontText.trim(), backText.trim());
    setFrontText("");
    setBackText("");
    setIsAddingCard(false);
    toast({
      title: "Card added!",
      description: "Your flashcard has been created.",
    });
  };

  const handleUpdateCard = () => {
    if (!editingCard || !frontText.trim() || !backText.trim()) {
      toast({
        title: "Both sides required",
        description: "Please fill in both the front and back of the card.",
        variant: "destructive",
      });
      return;
    }

    updateCard(editingCard, deck.id, frontText.trim(), backText.trim());
    setFrontText("");
    setBackText("");
    setEditingCard(null);
    toast({
      title: "Card updated!",
      description: "Your changes have been saved.",
    });
  };

  const handleDeleteCard = () => {
    if (cardToDelete) {
      deleteCard(cardToDelete, deck.id);
      setCardToDelete(null);
      toast({
        title: "Card deleted",
        description: "The flashcard has been removed.",
      });
    }
  };

  const openEditDialog = (cardId: string) => {
    const card = deckCards.find((c) => c.id === cardId);
    if (card) {
      setFrontText(card.front_text);
      setBackText(card.back_text);
      setEditingCard(cardId);
    }
  };

  const closeDialog = () => {
    setFrontText("");
    setBackText("");
    setIsAddingCard(false);
    setEditingCard(null);
  };

  // Card form content (shared between Dialog and Drawer)
  const CardFormContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="front" className="text-sm">
          Front (Question)
        </Label>
        <Textarea
          id="front"
          placeholder="Enter the question or prompt..."
          value={frontText}
          onChange={(e) => setFrontText(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="back" className="text-sm">
          Back (Answer)
        </Label>
        <Textarea
          id="back"
          placeholder="Enter the answer or explanation..."
          value={backText}
          onChange={(e) => setBackText(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>
    </div>
  );

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

        {/* Deck Header */}
        <div className="bg-card rounded-xl p-4 sm:p-6 card-shadow-elevated mb-6 sm:mb-8">
          <div className="flex flex-col gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-bold truncate">
                {deck.title}
              </h1>
              {deck.description && (
                <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                  {deck.description}
                </p>
              )}
              <div className="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-3 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {deckCards.length} cards
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/decks/${deck.id}/edit`}
                className="flex-1 sm:flex-none"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto h-9"
                >
                  <Edit3 className="w-4 h-4 mr-1.5" />
                  <span className="hidden xs:inline">Edit Deck</span>
                  <span className="xs:hidden">Edit</span>
                </Button>
              </Link>
              {deckCards.length > 0 && (
                <Link
                  href={`/decks/${deck.id}/study`}
                  className="flex-1 sm:flex-none"
                >
                  <Button
                    className="w-full sm:w-auto h-9 gradient-bg text-primary-foreground"
                    size="sm"
                  >
                    <Play className="w-4 h-4 mr-1.5" />
                    Study
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="font-display text-lg sm:text-xl font-semibold">
            Flashcards
          </h2>
          <Button
            onClick={() => setIsAddingCard(true)}
            size="sm"
            className="gap-1.5 h-9"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Add Card</span>
            <span className="xs:hidden">Add</span>
          </Button>
        </div>

        {deckCards.length === 0 ? (
          <div className="text-center py-12 sm:py-16 bg-card rounded-xl card-shadow">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">
              No cards yet
            </h3>
            <p className="text-muted-foreground text-sm mb-4 sm:mb-6 px-4">
              Add your first flashcard to start learning
            </p>
            <Button onClick={() => setIsAddingCard(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Card
            </Button>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {deckCards.map((card, index) => (
              <div
                key={card.id}
                className="bg-card rounded-xl p-3 sm:p-4 card-shadow hover:card-shadow-elevated transition-shadow"
              >
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] sm:text-xs text-muted-foreground mb-1.5 sm:mb-2">
                      Card {index + 1}
                    </div>
                    <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
                      <div>
                        <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5 sm:mb-1">
                          Front
                        </div>
                        <p className="text-xs sm:text-sm line-clamp-3">
                          {card.front_text}
                        </p>
                      </div>
                      <div>
                        <div className="text-[10px] sm:text-xs font-medium text-muted-foreground mb-0.5 sm:mb-1">
                          Back
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                          {card.back_text}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(card.id)}
                      className="h-8 w-8"
                    >
                      <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setCardToDelete(card.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Card - Use Drawer on mobile, Dialog on desktop */}
      {isMobile ? (
        <Drawer open={isAddingCard || !!editingCard} onOpenChange={closeDialog}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>
                {editingCard ? "Edit Flashcard" : "Add New Flashcard"}
              </DrawerTitle>
            </DrawerHeader>
            <div className="px-4 pb-2">
              <CardFormContent />
            </div>
            <DrawerFooter className="pt-2">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={closeDialog}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={editingCard ? handleUpdateCard : handleAddCard}
                  className="flex-1 gradient-bg text-primary-foreground"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCard ? "Save" : "Add Card"}
                </Button>
              </div>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={isAddingCard || !!editingCard} onOpenChange={closeDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCard ? "Edit Flashcard" : "Add New Flashcard"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <CardFormContent />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={closeDialog}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={editingCard ? handleUpdateCard : handleAddCard}
                className="flex-1 gradient-bg text-primary-foreground"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingCard ? "Save Changes" : "Add Card"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!cardToDelete}
        onOpenChange={() => setCardToDelete(null)}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this flashcard? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCard}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
