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

