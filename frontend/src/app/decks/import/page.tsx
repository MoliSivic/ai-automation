"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CheckCircle,
  Download,
  FileText,
  Loader2,
  Sparkles,
  Upload,
  XCircle,
} from "lucide-react";
import { useAppStore } from "@/stores/appStore";
import { useToast } from "@/hooks/use-toast";
import {
  backendFetch,
  downloadFromBackend,
  isBackendConnectionError,
} from "@/lib/backend/client";

interface ImportJob {
  id: string;
  deck_id: string | null;
  source_filename: string;
  status: "pending" | "processing" | "completed" | "failed" | string;
  error_message: string | null;
  deck_title: string | null;
  requested_card_count: number;
  style: string;
  ai_model: string | null;
  created_at: string;
  updated_at: string;
}

export default function ImportDeckPage() {
  const { toast } = useToast();
  const { settings, fetchDecks } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [deckTitle, setDeckTitle] = useState("");
  const [cardCount, setCardCount] = useState([
    settings.default_ai_card_count || 10,
  ]);
  const [style, setStyle] = useState(settings.default_ai_style || "concise");
  const [job, setJob] = useState<ImportJob | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isWorking = useMemo(
    () => job?.status === "pending" || job?.status === "processing",
    [job?.status],
  );

  useEffect(() => {
    if (!job || !isWorking) return;

    const interval = window.setInterval(async () => {
      try {
        const nextJob = await backendFetch<ImportJob>(
          `/api/imports/jobs/${job.id}`,
        );
        setJob(nextJob);
        if (nextJob.status === "completed") {
          await fetchDecks();
          toast({
            title: "Deck ready",
            description: "Your Anki deck has been generated.",
          });
        }
      } catch (error) {
        if (isBackendConnectionError(error)) {
          console.warn(`Failed to refresh import job: ${error.message}`);
        } else {
          console.error("Failed to refresh import job:", error);
        }
      }
    }, 2000);

    return () => window.clearInterval(interval);
  }, [fetchDecks, isWorking, job, toast]);

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "File required",
        description: "Choose a PDF or TXT study file first.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("deck_title", deckTitle.trim());
    formData.append("card_count", String(cardCount[0]));
    formData.append("style", style);
    formData.append("model", settings.ai_model);

    setIsUploading(true);
    try {
      const nextJob = await backendFetch<ImportJob>("/api/imports/upload", {
        method: "POST",
        body: formData,
      });
      setJob(nextJob);
      toast({
        title: "Import started",
        description: "The backend is extracting text and generating cards.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to start import.";
      toast({
        title: "Import failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async () => {
    if (!job?.deck_id) return;
    setIsDownloading(true);
    try {
      await downloadFromBackend(
        `/api/decks/${job.deck_id}/export`,
        `${job.deck_title || "anki-deck"}.apkg`,
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to download deck.";
      toast({
        title: "Download failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
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
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 sm:gap-2 text-muted-foreground hover:text-foreground mb-6 sm:mb-8 text-sm sm:text-base"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-card rounded-xl p-5 sm:p-8 card-shadow-elevated">
          <div className="flex items-center gap-3 mb-5 sm:mb-6">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-bg flex items-center justify-center">
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-xl sm:text-2xl font-bold">
                Import Study File
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm">
                PDF or TXT notes become Anki-ready flashcards
              </p>
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <div className="space-y-2">
              <Label htmlFor="studyFile" className="text-sm">
                Study File *
              </Label>
              <Input
                id="studyFile"
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="h-11"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                Supported files: PDF and TXT
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="deckTitle" className="text-sm">
                Deck Title
              </Label>
              <Input
                id="deckTitle"
                placeholder={file?.name.replace(/\.[^.]+$/, "") || "Optional"}
                value={deckTitle}
                onChange={(event) => setDeckTitle(event.target.value)}
                className="h-10 sm:h-11"
              />
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
              onClick={handleUpload}
              disabled={isUploading || isWorking}
              className="w-full gradient-bg text-primary-foreground py-5 sm:py-6 text-base sm:text-lg"
            >
              {isUploading || isWorking ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Generate Anki Deck
                </>
              )}
            </Button>
          </div>

          {job && (
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <div className="flex items-start gap-3">
                {job.status === "completed" ? (
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                ) : job.status === "failed" ? (
                  <XCircle className="w-5 h-5 text-destructive mt-0.5" />
                ) : (
                  <Loader2 className="w-5 h-5 text-primary mt-0.5 animate-spin" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium capitalize">{job.status}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {job.source_filename}
                  </p>
                  {job.error_message && (
                    <p className="text-sm text-destructive mt-2">
                      {job.error_message}
                    </p>
                  )}
                </div>
              </div>

              {job.status === "completed" && job.deck_id && (
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Link href={`/decks/${job.deck_id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Deck
                    </Button>
                  </Link>
                  <Button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    className="flex-1 gradient-bg text-primary-foreground"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isDownloading ? "Downloading..." : "Download .apkg"}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
