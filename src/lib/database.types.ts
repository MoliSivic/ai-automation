export type Database = {
  public: {
    Tables: {
      decks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          card_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string;
          card_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string;
          card_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cards: {
        Row: {
          id: string;
          deck_id: string;
          front_text: string;
          back_text: string;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          front_text: string;
          back_text: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          front_text?: string;
          back_text?: string;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          shuffle_enabled: boolean;
          daily_goal: number | null;
          default_ai_card_count: number;
          default_ai_style: string;
          ai_model: string;
          cards_per_session: number;
          theme: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          shuffle_enabled?: boolean;
          daily_goal?: number | null;
          default_ai_card_count?: number;
          default_ai_style?: string;
          ai_model?: string;
          cards_per_session?: number;
          theme?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          shuffle_enabled?: boolean;
          daily_goal?: number | null;
          default_ai_card_count?: number;
          default_ai_style?: string;
          ai_model?: string;
          cards_per_session?: number;
          theme?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          deck_id: string;
          started_at: string;
          ended_at: string | null;
          known_count: number;
          total_count: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          deck_id: string;
          started_at?: string;
          ended_at?: string | null;
          known_count?: number;
          total_count?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          deck_id?: string;
          started_at?: string;
          ended_at?: string | null;
          known_count?: number;
          total_count?: number;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
