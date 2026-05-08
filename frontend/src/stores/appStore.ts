"use client";

import { create } from "zustand";
import type {
  User,
  Deck,
  Card,
  Settings,
  StudySession,
  ThemeName,
} from "@/lib/mockData";
import {
  mockUser,
  mockDecks,
  mockCards,
  mockSettings,
  mockStudySessions,
} from "@/lib/mockData";
import { backendFetch } from "@/lib/backend/client";
import { createClient } from "@/lib/supabase/client";

const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

const DEFAULT_SETTINGS: Settings = {
  id: "",
  user_id: "",
  shuffle_enabled: true,
  daily_goal: 20,
  default_ai_card_count: 10,
  default_ai_style: "concise",
  ai_model: "gemini-2.5-flash-lite",
  cards_per_session: 10,
  theme: "ocean",
  updated_at: new Date().toISOString(),
};

interface AppState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;

  decks: Deck[];
  cards: Record<string, Card[]>;
  settings: Settings;
  studySessions: StudySession[];

  initialize: () => Promise<void>;

  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{
    success: boolean;
    needsConfirmation?: boolean;
    error?: string;
  }>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updatePassword: (password: string) => Promise<boolean>;
  resendConfirmationEmail: (email: string) => Promise<boolean>;

  fetchDecks: () => Promise<void>;
  fetchCards: (deckId: string) => Promise<void>;
  fetchSettings: () => Promise<void>;
  fetchStudySessions: () => Promise<void>;

  createDeck: (title: string, description: string) => Promise<Deck | null>;
  updateDeck: (
    deckId: string,
    title: string,
    description: string,
  ) => Promise<void>;
  deleteDeck: (deckId: string) => Promise<void>;

  addCard: (
    deckId: string,
    frontText: string,
    backText: string,
  ) => Promise<Card | null>;
  updateCard: (
    cardId: string,
    deckId: string,
    frontText: string,
    backText: string,
  ) => Promise<void>;
  deleteCard: (cardId: string, deckId: string) => Promise<void>;
  addCardsFromAI: (
    deckId: string,
    cards: Omit<Card, "id" | "deck_id" | "created_at" | "updated_at">[],
  ) => Promise<void>;

  updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
  setTheme: (theme: ThemeName) => Promise<void>;

  createStudySession: (
    deckId: string,
    knownCount: number,
    totalCount: number,
  ) => Promise<void>;
}

// --------------- Helper: create Supabase client lazily (only in non-mock mode) ---------------
function getSupabase() {
  return createClient();
}

function getAuthCallbackUrl(nextPath: "/dashboard" | "/reset-password") {
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", nextPath);
  return callbackUrl.toString();
}

let mockIdCounter = 1000;
function nextMockId() {
  return `mock-${++mockIdCounter}`;
}

// --------------- Mock implementations ---------------
function createMockStore(
  set: (fn: (state: AppState) => Partial<AppState>) => void,
  get: () => AppState,
): AppState {
  return {
    isAuthenticated: false,
    user: null,
    isLoading: true,
    decks: [],
    cards: {},
    settings: DEFAULT_SETTINGS,
    studySessions: [],

    initialize: async () => {
      set(() => ({
        isAuthenticated: true,
        user: mockUser,
        isLoading: false,
        decks: [...mockDecks],
        cards: JSON.parse(JSON.stringify(mockCards)),
        settings: { ...mockSettings },
        studySessions: [...mockStudySessions],
      }));
    },

    login: async () => {
      set(() => ({
        isAuthenticated: true,
        user: mockUser,
        decks: [...mockDecks],
        cards: JSON.parse(JSON.stringify(mockCards)),
        settings: { ...mockSettings },
        studySessions: [...mockStudySessions],
      }));
      return { success: true };
    },

    logout: async () => {
      set(() => ({
        isAuthenticated: false,
        user: null,
        decks: [],
        cards: {},
        settings: DEFAULT_SETTINGS,
        studySessions: [],
      }));
    },

    signup: async () => {
      // In mock mode, simulate the email verification flow
      // Don't auto-authenticate — the user will need to "verify" then log in
      return { success: true, needsConfirmation: true };
    },

    resetPassword: async () => true,
    updatePassword: async () => true,

    signInWithGoogle: async () => {
      // In mock mode, simulate Google OAuth by authenticating immediately
      set(() => ({
        isAuthenticated: true,
        user: {
          ...mockUser,
          full_name: "Google User",
          email: "user@gmail.com",
        },
        decks: [...mockDecks],
        cards: JSON.parse(JSON.stringify(mockCards)),
        settings: { ...mockSettings },
        studySessions: [...mockStudySessions],
      }));
      // Simulate the OAuth redirect
      if (typeof window !== "undefined") {
        window.location.href = "/dashboard";
      }
    },

    resendConfirmationEmail: async () => true,

    fetchDecks: async () => {},
    fetchCards: async () => {},
    fetchSettings: async () => {},
    fetchStudySessions: async () => {},

    createDeck: async (title: string, description: string) => {
      const newDeck: Deck = {
        id: nextMockId(),
        user_id: mockUser.id,
        title,
        description,
        card_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({
        decks: [newDeck, ...state.decks],
        cards: { ...state.cards, [newDeck.id]: [] },
      }));
      return newDeck;
    },

    updateDeck: async (deckId: string, title: string, description: string) => {
      set((state) => ({
        decks: state.decks.map((d) =>
          d.id === deckId
            ? { ...d, title, description, updated_at: new Date().toISOString() }
            : d,
        ),
      }));
    },

    deleteDeck: async (deckId: string) => {
      set((state) => {
        const remainingCards = { ...state.cards };
        delete remainingCards[deckId];
        return {
          decks: state.decks.filter((d) => d.id !== deckId),
          cards: remainingCards,
        };
      });
    },

    addCard: async (deckId: string, frontText: string, backText: string) => {
      const existing = get().cards[deckId] || [];
      const newCard: Card = {
        id: nextMockId(),
        deck_id: deckId,
        front_text: frontText,
        back_text: backText,
        position: existing.length + 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      set((state) => ({
        cards: {
          ...state.cards,
          [deckId]: [...(state.cards[deckId] || []), newCard],
        },
        decks: state.decks.map((d) =>
          d.id === deckId ? { ...d, card_count: d.card_count + 1 } : d,
        ),
      }));
      return newCard;
    },

    updateCard: async (
      cardId: string,
      deckId: string,
      frontText: string,
      backText: string,
    ) => {
      set((state) => ({
        cards: {
          ...state.cards,
          [deckId]: (state.cards[deckId] || []).map((c) =>
            c.id === cardId
              ? {
                  ...c,
                  front_text: frontText,
                  back_text: backText,
                  updated_at: new Date().toISOString(),
                }
              : c,
          ),
        },
      }));
    },

    deleteCard: async (cardId: string, deckId: string) => {
      set((state) => ({
        cards: {
          ...state.cards,
          [deckId]: (state.cards[deckId] || []).filter((c) => c.id !== cardId),
        },
        decks: state.decks.map((d) =>
          d.id === deckId
            ? { ...d, card_count: Math.max(0, d.card_count - 1) }
            : d,
        ),
      }));
    },

    addCardsFromAI: async (
      deckId: string,
      cards: Omit<Card, "id" | "deck_id" | "created_at" | "updated_at">[],
    ) => {
      const now = new Date().toISOString();
      const newCards: Card[] = cards.map((c) => ({
        ...c,
        id: nextMockId(),
        deck_id: deckId,
        created_at: now,
        updated_at: now,
      }));
      set((state) => ({
        cards: {
          ...state.cards,
          [deckId]: [...(state.cards[deckId] || []), ...newCards],
        },
        decks: state.decks.map((d) =>
          d.id === deckId
            ? { ...d, card_count: d.card_count + newCards.length }
            : d,
        ),
      }));
    },

    updateSettings: async (newSettings: Partial<Settings>) => {
      set((state) => ({
        settings: {
          ...state.settings,
          ...newSettings,
          updated_at: new Date().toISOString(),
        },
      }));
    },

    setTheme: async (theme: ThemeName) => {
      await get().updateSettings({ theme });
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", theme);
      }
    },

    createStudySession: async (
      deckId: string,
      knownCount: number,
      totalCount: number,
    ) => {
      const session: StudySession = {
        id: nextMockId(),
        user_id: mockUser.id,
        deck_id: deckId,
        started_at: new Date().toISOString(),
        ended_at: new Date().toISOString(),
        known_count: knownCount,
        total_count: totalCount,
      };
      set((state) => ({
        studySessions: [session, ...state.studySessions],
      }));
    },
  };
}

// --------------- Supabase implementations ---------------
function createSupabaseStore(
  set: (fn: (state: AppState) => Partial<AppState>) => void,
  get: () => AppState,
): AppState {
  return {
    isAuthenticated: false,
    user: null,
    isLoading: true,
    decks: [],
    cards: {},
    settings: DEFAULT_SETTINGS,
    studySessions: [],

    initialize: async () => {
      const supabase = getSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        set(() => ({
          isAuthenticated: true,
          user: {
            id: user.id,
            email: user.email || "",
            full_name: (user.user_metadata?.full_name as string) || "",
            created_at: user.created_at,
          },
          isLoading: false,
        }));
        await get().fetchDecks();
        await get().fetchSettings();
        await get().fetchStudySessions();
      } else {
        set(() => ({ isAuthenticated: false, user: null, isLoading: false }));
      }
    },

    login: async (email: string, password: string) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Supabase returns specific error messages we can use
        if (error.message === "Email not confirmed") {
          return { success: false, error: "email_not_confirmed" };
        }
        return { success: false, error: error.message };
      }

      if (!data.user) return { success: false, error: "No user returned" };

      set(() => ({
        isAuthenticated: true,
        user: {
          id: data.user.id,
          email: data.user.email || "",
          full_name: (data.user.user_metadata?.full_name as string) || "",
          created_at: data.user.created_at,
        },
      }));

      await get().fetchDecks();
      await get().fetchSettings();
      await get().fetchStudySessions();
      return { success: true };
    },

    logout: async () => {
      const supabase = getSupabase();
      await supabase.auth.signOut();
      set(() => ({
        isAuthenticated: false,
        user: null,
        decks: [],
        cards: {},
        settings: DEFAULT_SETTINGS,
        studySessions: [],
      }));
    },

    signup: async (email: string, password: string, fullName: string) => {
      const supabase = getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: getAuthCallbackUrl("/dashboard"),
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user) {
        return { success: false, error: "Signup failed" };
      }

      // Supabase returns identities: [] when the email is already registered
      // (to prevent email enumeration). Detect this case.
      if (data.user.identities?.length === 0) {
        return {
          success: false,
          error:
            "An account with this email already exists. Please log in instead.",
        };
      }

      // Email confirmation is needed when user has no confirmed_at
      if (!data.user.confirmed_at) {
        return { success: true, needsConfirmation: true };
      }

      // If email confirmation is disabled in Supabase, user is immediately confirmed
      set(() => ({
        isAuthenticated: true,
        user: {
          id: data.user!.id,
          email: data.user!.email || "",
          full_name: fullName,
          created_at: data.user!.created_at,
        },
      }));

      await get().fetchSettings();
      return { success: true, needsConfirmation: false };
    },

    signInWithGoogle: async () => {
      const supabase = getSupabase();
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getAuthCallbackUrl("/dashboard"),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
    },

    resendConfirmationEmail: async (email: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: getAuthCallbackUrl("/dashboard"),
        },
      });
      return !error;
    },

    resetPassword: async (email: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: getAuthCallbackUrl("/reset-password"),
      });
      return !error;
    },

    updatePassword: async (password: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      return !error;
    },

    fetchDecks: async () => {
      try {
        const decks = await backendFetch<Deck[]>("/api/decks");
        set(() => ({ decks }));
      } catch (error) {
        console.error("Failed to fetch decks:", error);
      }
    },

    fetchCards: async (deckId: string) => {
      try {
        const fetchedCards = await backendFetch<Card[]>(
          `/api/decks/${deckId}/cards`,
        );
        set((state) => ({
          cards: { ...state.cards, [deckId]: fetchedCards },
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, card_count: fetchedCards.length }
              : deck,
          ),
        }));
      } catch (error) {
        console.error("Failed to fetch cards:", error);
      }
    },

    fetchSettings: async () => {
      try {
        const settings = await backendFetch<Settings>("/api/settings");
        set(() => ({ settings: { ...settings, theme: settings.theme as ThemeName } }));
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      }
    },

    fetchStudySessions: async () => {
      try {
        const studySessions =
          await backendFetch<StudySession[]>("/api/study-sessions");
        set(() => ({ studySessions }));
      } catch (error) {
        console.error("Failed to fetch study sessions:", error);
      }
    },

    createDeck: async (title: string, description: string) => {
      try {
        const deck = await backendFetch<Deck>("/api/decks", {
          method: "POST",
          body: JSON.stringify({ title, description }),
        });

        set((state) => ({
          decks: [deck, ...state.decks],
          cards: { ...state.cards, [deck.id]: [] },
        }));
        return deck;
      } catch (error) {
        console.error("Failed to create deck:", error);
        return null;
      }
    },

    updateDeck: async (deckId: string, title: string, description: string) => {
      try {
        const deck = await backendFetch<Deck>(`/api/decks/${deckId}`, {
          method: "PATCH",
          body: JSON.stringify({ title, description }),
        });

        set((state) => ({
          decks: state.decks.map((existing) =>
            existing.id === deckId ? deck : existing,
          ),
        }));
      } catch (error) {
        console.error("Failed to update deck:", error);
      }
    },

    deleteDeck: async (deckId: string) => {
      try {
        await backendFetch<void>(`/api/decks/${deckId}`, {
          method: "DELETE",
        });

        set((state) => {
          const remainingCards = { ...state.cards };
          delete remainingCards[deckId];
          return {
            decks: state.decks.filter((deck) => deck.id !== deckId),
            cards: remainingCards,
          };
        });
      } catch (error) {
        console.error("Failed to delete deck:", error);
      }
    },

    addCard: async (deckId: string, frontText: string, backText: string) => {
      try {
        const card = await backendFetch<Card>(`/api/decks/${deckId}/cards`, {
          method: "POST",
          body: JSON.stringify({
            front_text: frontText,
            back_text: backText,
          }),
        });

        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: [...(state.cards[deckId] || []), card],
          },
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, card_count: deck.card_count + 1 }
              : deck,
          ),
        }));
        return card;
      } catch (error) {
        console.error("Failed to add card:", error);
        return null;
      }
    },

    updateCard: async (
      cardId: string,
      deckId: string,
      frontText: string,
      backText: string,
    ) => {
      try {
        const card = await backendFetch<Card>(`/api/cards/${cardId}`, {
          method: "PATCH",
          body: JSON.stringify({
            front_text: frontText,
            back_text: backText,
          }),
        });

        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: (state.cards[deckId] || []).map((existing) =>
              existing.id === cardId ? card : existing,
            ),
          },
        }));
      } catch (error) {
        console.error("Failed to update card:", error);
      }
    },

    deleteCard: async (cardId: string, deckId: string) => {
      try {
        await backendFetch<void>(`/api/cards/${cardId}`, {
          method: "DELETE",
        });

        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: (state.cards[deckId] || []).filter(
              (card) => card.id !== cardId,
            ),
          },
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, card_count: Math.max(0, deck.card_count - 1) }
              : deck,
          ),
        }));
      } catch (error) {
        console.error("Failed to delete card:", error);
      }
    },

    addCardsFromAI: async (
      deckId: string,
      cards: Omit<Card, "id" | "deck_id" | "created_at" | "updated_at">[],
    ) => {
      const existingCards = get().cards[deckId] || [];
      try {
        const savedCards = await backendFetch<Card[]>(
          `/api/decks/${deckId}/cards/bulk`,
          {
            method: "POST",
            body: JSON.stringify({
              cards: cards.map((card) => ({
                front_text: card.front_text,
                back_text: card.back_text,
                position: card.position,
              })),
            }),
          },
        );

        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: [...existingCards, ...savedCards],
          },
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, card_count: deck.card_count + savedCards.length }
              : deck,
          ),
        }));
      } catch (error) {
        console.error("Failed to save AI cards:", error);
      }
    },

    updateSettings: async (newSettings: Partial<Settings>) => {
      const updateData = { ...newSettings };
      delete updateData.id;
      delete updateData.user_id;
      delete updateData.updated_at;

      try {
        const settings = await backendFetch<Settings>("/api/settings", {
          method: "PATCH",
          body: JSON.stringify(updateData),
        });

        set(() => ({ settings: { ...settings, theme: settings.theme as ThemeName } }));
      } catch (error) {
        console.error("Failed to update settings:", error);
      }
    },

    setTheme: async (theme: ThemeName) => {
      await get().updateSettings({ theme });
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", theme);
      }
    },

    createStudySession: async (
      deckId: string,
      knownCount: number,
      totalCount: number,
    ) => {
      try {
        const session = await backendFetch<StudySession>("/api/study-sessions", {
          method: "POST",
          body: JSON.stringify({
            deck_id: deckId,
            known_count: knownCount,
            total_count: totalCount,
          }),
        });
        set((state) => ({
          studySessions: [session, ...state.studySessions],
        }));
      } catch (error) {
        console.error("Failed to create study session:", error);
      }
    },
  };
}

// --------------- Store creation ---------------
export const useAppStore = create<AppState>()((set, get) =>
  IS_MOCK ? createMockStore(set, get) : createSupabaseStore(set, get),
);
