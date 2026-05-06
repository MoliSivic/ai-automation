DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_updated_at();
DROP TABLE IF EXISTS public.study_sessions CASCADE;
DROP TABLE IF EXISTS public.cards CASCADE;
DROP TABLE IF EXISTS public.decks CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;
CREATE TABLE public.decks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    card_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
    front_text TEXT NOT NULL,
    back_text TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    shuffle_enabled BOOLEAN NOT NULL DEFAULT true,
    daily_goal INTEGER DEFAULT 20,
    default_ai_card_count INTEGER NOT NULL DEFAULT 10,
    default_ai_style TEXT NOT NULL DEFAULT 'concise',
    ai_model TEXT NOT NULL DEFAULT 'gpt-4',
    cards_per_session INTEGER NOT NULL DEFAULT 10,
    theme TEXT NOT NULL DEFAULT 'ocean',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.study_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deck_id UUID REFERENCES public.decks(id) ON DELETE
    SET NULL,
        started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        ended_at TIMESTAMPTZ,
        known_count INTEGER NOT NULL DEFAULT 0,
        total_count INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_decks_user_id ON public.decks(user_id);
CREATE INDEX idx_decks_created_at ON public.decks(user_id, created_at DESC);
CREATE INDEX idx_cards_deck_id ON public.cards(deck_id);
CREATE INDEX idx_cards_position ON public.cards(deck_id, position ASC);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_started ON public.study_sessions(user_id, started_at DESC);
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own decks" ON public.decks FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own decks" ON public.decks FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own decks" ON public.decks FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own decks" ON public.decks FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view cards in their decks" ON public.cards FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.decks
            WHERE decks.id = cards.deck_id
                AND decks.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can create cards in their decks" ON public.cards FOR
INSERT WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.decks
            WHERE decks.id = cards.deck_id
                AND decks.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can update cards in their decks" ON public.cards FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.decks
            WHERE decks.id = cards.deck_id
                AND decks.user_id = auth.uid()
        )
    ) WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.decks
            WHERE decks.id = cards.deck_id
                AND decks.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can delete cards in their decks" ON public.cards FOR DELETE USING (
    EXISTS (
        SELECT 1
        FROM public.decks
        WHERE decks.id = cards.deck_id
            AND decks.user_id = auth.uid()
    )
);
CREATE POLICY "Users can view their own settings" ON public.user_settings FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own settings" ON public.user_settings FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own settings" ON public.user_settings FOR
UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own study sessions" ON public.study_sessions FOR
SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own study sessions" ON public.study_sessions FOR
INSERT WITH CHECK (auth.uid() = user_id);
CREATE OR REPLACE FUNCTION public.update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER set_updated_at_decks BEFORE
UPDATE ON public.decks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_cards BEFORE
UPDATE ON public.cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER set_updated_at_user_settings BEFORE
UPDATE ON public.user_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER SECURITY DEFINER
SET search_path = '' AS $$ BEGIN
INSERT INTO public.user_settings (user_id)
VALUES (NEW.id);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
GRANT USAGE ON SCHEMA public TO anon,
    authenticated;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.decks TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON public.cards TO authenticated;
GRANT SELECT,
    INSERT,
    UPDATE ON public.user_settings TO authenticated;
GRANT SELECT,
    INSERT ON public.study_sessions TO authenticated;