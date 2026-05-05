"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  mockUser,
  mockDecks,
  mockCards,
  mockSettings,
  mockStudySessions,
  type User,
  type Deck,
  type Card,
  type Settings,
  type StudySession,
} from "@/lib/mockData";

interface AppState {
  // Auth state
  isAuthenticated: boolean;
  user: User | null;

  // Data
  decks: Deck[];
  cards: Record<string, Card[]>;
  settings: Settings;
  studySessions: StudySession[];

  // Actions - Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<boolean>;

  // Actions - Decks
  createDeck: (title: string, description: string) => Deck;
  updateDeck: (deckId: string, title: string, description: string) => void;
  deleteDeck: (deckId: string) => void;

  // Actions - Cards
  addCard: (deckId: string, frontText: string, backText: string) => Card;
  updateCard: (
    cardId: string,
    deckId: string,
    frontText: string,
    backText: string,
  ) => void;
  deleteCard: (cardId: string, deckId: string) => void;
  addCardsFromAI: (
    deckId: string,
    cards: Omit<Card, "id" | "deck_id" | "created_at" | "updated_at">[],
  ) => void;

  // Actions - Settings
  updateSettings: (newSettings: Partial<Settings>) => void;
  setTheme: (theme: string) => void;

  // Actions - Study
  createStudySession: (
    deckId: string,
    knownCount: number,
    totalCount: number,
  ) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      user: null,
      decks: [],
      cards: {},
      settings: mockSettings,
      studySessions: [],

      // Auth actions
      login: async (email: string, password: string) => {
        // Mock login - accept any valid email format
        if (email && password.length >= 6) {
          set({
            isAuthenticated: true,
            user: { ...mockUser, email },
            decks: mockDecks,
            cards: mockCards,
            studySessions: mockStudySessions,
          });
          return true;
        }
        return false;
      },

      logout: () => {
        set({
          isAuthenticated: false,
          user: null,
          decks: [],
          cards: {},
          studySessions: [],
        });
      },

      signup: async (email: string, password: string, fullName: string) => {
        if (email && password.length >= 6 && fullName) {
          set({
            isAuthenticated: true,
            user: {
              id: `user-${Date.now()}`,
              email,
              full_name: fullName,
              created_at: new Date().toISOString(),
            },
            decks: [],
            cards: {},
            studySessions: [],
          });
          return true;
        }
        return false;
      },

      // Deck actions
      createDeck: (title: string, description: string) => {
        const newDeck: Deck = {
          id: `deck-${Date.now()}`,
          user_id: get().user?.id || "",
          title,
          description,
          card_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({
          decks: [...state.decks, newDeck],
          cards: { ...state.cards, [newDeck.id]: [] },
        }));
        return newDeck;
      },

      updateDeck: (deckId: string, title: string, description: string) => {
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
      },

      deleteDeck: (deckId: string) => {
        set((state) => {
          const { [deckId]: _, ...remainingCards } = state.cards;
          return {
            decks: state.decks.filter((deck) => deck.id !== deckId),
            cards: remainingCards,
          };
        });
      },

      // Card actions
      addCard: (deckId: string, frontText: string, backText: string) => {
        const deckCards = get().cards[deckId] || [];
        const newCard: Card = {
          id: `card-${Date.now()}`,
          deck_id: deckId,
          front_text: frontText,
          back_text: backText,
          position: deckCards.length + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: [...(state.cards[deckId] || []), newCard],
          },
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  card_count: deck.card_count + 1,
                  updated_at: new Date().toISOString(),
                }
              : deck,
          ),
        }));
        return newCard;
      },

      updateCard: (
        cardId: string,
        deckId: string,
        frontText: string,
        backText: string,
      ) => {
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
      },

      deleteCard: (cardId: string, deckId: string) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: (state.cards[deckId] || []).filter(
              (card) => card.id !== cardId,
            ),
          },
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  card_count: Math.max(0, deck.card_count - 1),
                  updated_at: new Date().toISOString(),
                }
              : deck,
          ),
        }));
      },

      addCardsFromAI: (
        deckId: string,
        cards: Omit<Card, "id" | "deck_id" | "created_at" | "updated_at">[],
      ) => {
        const existingCards = get().cards[deckId] || [];
        const newCards: Card[] = cards.map((card, index) => ({
          id: `card-${Date.now()}-${index}`,
          deck_id: deckId,
          front_text: card.front_text,
          back_text: card.back_text,
          position: existingCards.length + index + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }));

        set((state) => ({
          cards: {
            ...state.cards,
            [deckId]: [...existingCards, ...newCards],
          },
          decks: state.decks.map((deck) =>
            deck.id === deckId
              ? {
                  ...deck,
                  card_count: deck.card_count + cards.length,
                  updated_at: new Date().toISOString(),
                }
              : deck,
          ),
        }));
      },

      // Settings actions
      updateSettings: (newSettings: Partial<Settings>) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
            updated_at: new Date().toISOString(),
          },
        }));
      },

      setTheme: (theme: string) => {
        set((state) => ({
          settings: {
            ...state.settings,
            theme,
            updated_at: new Date().toISOString(),
          },
        }));
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },

      // Study actions
      createStudySession: (
        deckId: string,
        knownCount: number,
        totalCount: number,
      ) => {
        const newSession: StudySession = {
          id: `session-${Date.now()}`,
          user_id: get().user?.id || "",
          deck_id: deckId,
          started_at: new Date().toISOString(),
          ended_at: new Date().toISOString(),
          known_count: knownCount,
          total_count: totalCount,
        };
        set((state) => ({
          studySessions: [...state.studySessions, newSession],
        }));
      },
    }),
    {
      name: "flashcard-app-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
        decks: state.decks,
        cards: state.cards,
        settings: state.settings,
        studySessions: state.studySessions,
      }),
    },
  ),
);
