# FlashGenius Backend

FastAPI backend for the AI flashcard automation workflow:

PDF/TXT upload or watched file -> text extraction -> Gemini flashcards -> PostgreSQL records -> Anki `.apkg` export.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Create the database:

```bash
createdb "ai-automation-db"
```

Update `.env` with your PostgreSQL password, Supabase URL/anon key, and Gemini API key.

Run the API:

```bash
uvicorn app.main:app --reload --port 8000
```

Run the automation watcher:

```bash
python -m app.worker
```

Drop `.pdf` or `.txt` files into `backend/storage/inbox`. The watcher uses `WORKER_USER_ID` to decide which authenticated user owns decks created from dropped files.

## Import Rules

- Browser uploads and inbox files share the same card-count limit of 1-30 cards.
- Supported generation styles are `concise`, `detailed`, `simple`, and `academic`.
- Unsupported styles fall back to `concise` so imports still complete with a predictable prompt.
- Empty deck titles fall back to the source filename, with underscores and dashes turned into spaces.
- Generated deck descriptions include the source filename and extracted word count when readable text is found.
