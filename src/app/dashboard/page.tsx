"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Plus,
  Search,
  BookOpen,
  MoreVertical,
  Trash2,
  Edit3,
  Play,
  LogOut,
  Settings,
  Wand2,
  Menu,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DarkModeToggle } from "@/components/dark-mode-toggle";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatDistanceToNow } from "date-fns";

export default function DashboardPage() {
  const router = useRouter();
  const { decks, user, logout, deleteDeck } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const filteredDecks = useMemo(() => {
    if (!searchQuery.trim()) return decks;
    return decks.filter((deck) =>
      deck.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [decks, searchQuery]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const handleDeleteDeck = async () => {
    if (deckToDelete) {
      await deleteDeck(deckToDelete);
      setDeckToDelete(null);
    }
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

          <div className="hidden sm:flex items-center gap-2 sm:gap-3">
            <DarkModeToggle />
            <Link href="/settings">
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-medium text-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="hidden md:inline">{user?.full_name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-popover">
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="sm:hidden">
              <Button variant="ghost" size="icon" className="-mr-2">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[350px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-primary-foreground font-medium">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{user?.full_name}</p>
                    <p className="text-sm text-muted-foreground font-normal truncate max-w-[180px]">
                      {user?.email}
                    </p>
                  </div>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6 space-y-2">
                <Link
                  href="/settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3"
                  >
                    <Settings className="w-5 h-5" />
                    Settings
                  </Button>
                </Link>
                <DarkModeToggle className="w-full justify-start gap-3 px-4 h-10 rounded-md font-normal" />
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  Log out
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold">
                My Decks
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base mt-1">
                {decks.length} {decks.length === 1 ? "deck" : "decks"} total
              </p>
            </div>

            <div className="hidden sm:flex gap-3">
              <Link href="/decks/ai-generate">
                <Button variant="outline" className="gap-2">
                  <Wand2 className="w-4 h-4" />
                  AI Generate
                </Button>
              </Link>
              <Link href="/decks/new">
                <Button className="gradient-bg text-primary-foreground gap-2">
                  <Plus className="w-4 h-4" />
                  New Deck
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1 sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search decks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 sm:pl-10 h-10 sm:h-11"
              />
            </div>

            <div className="flex sm:hidden gap-2">
              <Link href="/decks/ai-generate">
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Wand2 className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/decks/new">
                <Button
                  size="icon"
                  className="h-10 w-10 gradient-bg text-primary-foreground"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {filteredDecks.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg sm:text-xl font-semibold mb-2">
              {searchQuery ? "No decks found" : "No decks yet"}
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Create your first deck to start learning"}
            </p>
            {!searchQuery && (
              <Link href="/decks/new">
                <Button className="gradient-bg text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Deck
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredDecks.map((deck) => (
              <div
                key={deck.id}
                className="bg-card rounded-xl p-4 sm:p-6 card-shadow hover:card-shadow-elevated transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <Link href={`/decks/${deck.id}`}>
                      <h3 className="font-display font-semibold text-base sm:text-lg truncate group-hover:text-primary transition-colors">
                        {deck.title}
                      </h3>
                    </Link>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                      {deck.description || "No description"}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 h-8 w-8"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem
                        onClick={() => router.push(`/decks/${deck.id}/edit`)}
                        className="cursor-pointer"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeckToDelete(deck.id)}
                        className="text-destructive cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    {deck.card_count} cards
                  </span>
                  <span className="truncate">
                    {formatDistanceToNow(new Date(deck.updated_at), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                <div className="flex gap-2 pt-3 sm:pt-4 border-t border-border">
                  <Link href={`/decks/${deck.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-9 text-xs sm:text-sm"
                    >
                      View
                    </Button>
                  </Link>
                  <Link href={`/decks/${deck.id}/study`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full h-9 gradient-bg text-primary-foreground gap-1.5 text-xs sm:text-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Study
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AlertDialog
        open={!!deckToDelete}
        onOpenChange={() => setDeckToDelete(null)}
      >
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Deck</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this deck? This action cannot be
              undone and all flashcards in this deck will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDeck}
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
