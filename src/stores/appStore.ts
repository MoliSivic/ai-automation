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
  generateMockCards as generateMockCardsData,
} from "@/lib/mockData";

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
  // Dynamic import to avoid errors when env vars are placeholder values
  const { createClient } = require("@/lib/supabase/client");
  return createClient();
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

    signup: async (_email: string, _password: string, _fullName: string) => {
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
        const { [deckId]: _, ...remainingCards } = state.cards;
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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
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
          redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        },
      });
      return !error;
    },

    resetPassword: async (email: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      return !error;
    },

    updatePassword: async (password: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.auth.updateUser({ password });
      return !error;
    },

    fetchDecks: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data) return;
      const fetchedDecks = data as Deck[];

      if (fetchedDecks.length === 0) {
        set(() => ({ decks: [] }));
        return;
      }

      const deckIds = fetchedDecks.map((deck) => deck.id);
      const { data: cardRows, error: cardsError } = await supabase
        .from("cards")
        .select("deck_id")
        .in("deck_id", deckIds);

      if (cardsError || !cardRows) {
        set(() => ({ decks: fetchedDecks }));
        return;
      }

      const cardCountByDeck = new Map<string, number>();
      for (const card of cardRows) {
        cardCountByDeck.set(
          card.deck_id,
          (cardCountByDeck.get(card.deck_id) ?? 0) + 1,
        );
      }

      const decksWithSyncedCounts = fetchedDecks.map((deck) => ({
        ...deck,
        card_count: cardCountByDeck.get(deck.id) ?? 0,
      }));

      set(() => ({ decks: decksWithSyncedCounts }));
    },

    fetchCards: async (deckId: string) => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("deck_id", deckId)
        .order("position", { ascending: true });

      if (!error && data) {
        set((state) => ({
          cards: { ...state.cards, [deckId]: data },
          decks: state.decks.map((deck) =>
            deck.id === deckId ? { ...deck, card_count: data.length } : deck,
          ),
        }));
      }
    },

    fetchSettings: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .single();

      if (!error && data) {
        set(() => ({ settings: { ...data, theme: data.theme as ThemeName } }));
      }
    },

    fetchStudySessions: async () => {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .order("started_at", { ascending: false });

      if (!error && data) {
        set(() => ({ studySessions: data }));
      }
    },

    createDeck: async (title: string, description: string) => {
      const supabase = getSupabase();
      const userId = get().user?.id;
      if (!userId) return null;

      const { data, error } = await supabase
        .from("decks")
        .insert({ user_id: userId, title, description })
        .select()
        .single();

      if (error || !data) return null;

      set((state) => ({
        decks: [data, ...state.decks],
        cards: { ...state.cards, [data.id]: [] },
      }));
      return data;
    },

    updateDeck: async (deckId: string, title: string, description: string) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("decks")
        .update({ title, description })
        .eq("id", deckId);

      if (!error) {
        set((state) => ({
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  title,
                  description,
                  updated_at: new Date().toISOString(),
                }
              : deck,
          ),
        }));
      }
    },

    deleteDeck: async (deckId: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("decks").delete().eq("id", deckId);

      if (!error) {
        set((state) => {
          const { [deckId]: _, ...remainingCards } = state.cards;
          return {
            decks: state.decks.filter((deck) => deck.id !== deckId),
            cards: remainingCards,
          };
        });
      }
    },

    addCard: async (deckId: string, frontText: string, backText: string) => {
      const supabase = getSupabase();
      const existingCards = get().cards[deckId] || [];

      const { data, error } = await supabase
        .from("cards")
        .insert({
          deck_id: deckId,
          front_text: frontText,
          back_text: backText,
          position: existingCards.length + 1,
        })
        .select()
        .single();

      if (error || !data) return null;

      set((state) => ({
        cards: {
          ...state.cards,
          [deckId]: [...(state.cards[deckId] || []), data],
        },
        decks: state.decks.map((deck) =>
          deck.id === deckId
            ? { ...deck, card_count: deck.card_count + 1 }
            : deck,
        ),
      }));
      return data;
    },

    updateCard: async (
      cardId: string,
      deckId: string,
      frontText: string,
      backText: string,
    ) => {
      const supabase = getSupabase();
      const { error } = await supabase
        .from("cards")
        .update({ front_text: frontText, back_text: backText })
        .eq("id", cardId);

      if (!error) {
        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: (state.cards[deckId] || []).map((card) =>
              card.id === cardId
                ? {
                    ...card,
                    front_text: frontText,
                    back_text: backText,
                    updated_at: new Date().toISOString(),
                  }
                : card,
            ),
          },
        }));
      }
    },

    deleteCard: async (cardId: string, deckId: string) => {
      const supabase = getSupabase();
      const { error } = await supabase.from("cards").delete().eq("id", cardId);

      if (!error) {
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
      }
    },

    addCardsFromAI: async (
      deckId: string,
      cards: Omit<Card, "id" | "deck_id" | "created_at" | "updated_at">[],
    ) => {
      const supabase = getSupabase();
      const existingCards = get().cards[deckId] || [];

      const cardsToInsert = cards.map((card, index) => ({
        deck_id: deckId,
        front_text: card.front_text,
        back_text: card.back_text,
        position: existingCards.length + index + 1,
      }));

      const { data, error } = await supabase
        .from("cards")
        .insert(cardsToInsert)
        .select();

      if (!error && data) {
        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: [...existingCards, ...data],
          },
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? { ...deck, card_count: deck.card_count + data.length }
              : deck,
          ),
        }));
      }
    },

    updateSettings: async (newSettings: Partial<Settings>) => {
      const supabase = getSupabase();
      const userId = get().user?.id;
      if (!userId) return;

      const {
        id: _id,
        user_id: _uid,
        updated_at: _ua,
        ...updateData
      } = newSettings;

      const { error } = await supabase
        .from("user_settings")
        .update(
          updateData as import("@/lib/database.types").Database["public"]["Tables"]["user_settings"]["Update"],
        )
        .eq("user_id", userId);

      if (!error) {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            updated_at: new Date().toISOString(),
          },
        }));
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
      const supabase = getSupabase();
      const userId = get().user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from("study_sessions")
        .insert({
          user_id: userId,
          deck_id: deckId,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          known_count: knownCount,
          total_count: totalCount,
        })
        .select()
        .single();

      if (!error && data) {
        set((state) => ({
          studySessions: [data, ...state.studySessions],
        }));
      }
    },
  };
}

// --------------- Store creation ---------------
export const useAppStore = create<AppState>()((set, get) =>
  IS_MOCK ? createMockStore(set, get) : createSupabaseStore(set, get),
);
