# FlashGenius AI Flashcard Automation

This project helps students turn study notes into Anki flashcards.

Workflow:

```text
Frontend: Next.js + React + TypeScript + Tailwind CSS
        ↓
Backend: Python FastAPI
        ↓
Automation Worker: watchdog + pypdf + Gemini + genanki
        ↓
Database: PostgreSQL
        ↓
Output: .apkg Anki deck
```

## Project Structure

- `frontend/` - Next.js frontend. Supabase is used for authentication only.
- `backend/` - FastAPI backend for decks, cards, settings, study sessions, uploads, Gemini generation, local storage, watchdog imports, and Anki export.
- `backend/storage/inbox/` - drop `.pdf` or `.txt` files here when running the watchdog worker.
- `backend/storage/exports/` - generated `.apkg` files.

## Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Required frontend env values:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
createdb "ai-automation-db"
uvicorn app.main:app --reload --port 8000
```

Required backend env values:

```bash
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/ai-automation-db
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

## Watchdog Worker

Set `WORKER_USER_ID` in `backend/.env` to the Supabase user ID that should own decks created from dropped files.

```bash
cd backend
source .venv/bin/activate
python -m app.worker
```

Then drop a `.pdf` or `.txt` file into `backend/storage/inbox/`.

## Verification

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
cd ..
cd backend && pytest tests
```
