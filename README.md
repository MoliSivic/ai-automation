# FlashGenius

FlashGenius is an AI flashcard automation platform that converts study material into review-ready Anki decks. Students can upload or drop PDF and TXT files, extract note content, generate question-and-answer flashcards with Gemini, store the results in PostgreSQL, and export `.apkg` decks for Anki.

## Architecture

```text
frontend              next.js, react, typescript, tailwind css
backend               fastapi, sqlalchemy, pydantic
authentication        supabase auth
database              postgresql
file processing       local storage, watchdog, pypdf
ai generation         gemini api
anki export           genanki
```

## Repository Layout

```text
frontend/             web application and supabase auth flow
backend/              fastapi api, worker, database models, exporters
backend/storage/      local uploads, watched inbox, and generated exports
backend/tests/        backend unit tests
```

## Features

- Email/password authentication through Supabase.
- Protected dashboard with decks, cards, settings, and study sessions.
- Manual deck and flashcard management.
- Paste-notes AI generation flow for creating flashcards from text.
- PDF and TXT upload flow for automated extraction and generation.
- Watchdog worker for processing files dropped into `backend/storage/inbox`.
- PostgreSQL persistence for decks, cards, settings, jobs, and sessions.
- Anki `.apkg` export through `genanki`.

## Prerequisites

- Node.js 20 or newer
- npm
- Python 3.12 or newer
- PostgreSQL 15 or newer
- Supabase project for authentication
- Gemini API key

## Environment

Create the frontend environment file:

```bash
cd frontend
cp .env.example .env.local
```

Required frontend variables:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Create the backend environment file:

```bash
cd backend
cp .env.example .env
```

Required backend variables:

```bash
DATABASE_URL=postgresql+psycopg://postgres:your-password@localhost:5432/ai-automation-db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

## Local Development

Create the PostgreSQL database:

```bash
createdb "ai-automation-db"
```

Install and run the backend:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open the app at:

```text
http://localhost:3000
```

## Automation Worker

The worker watches `backend/storage/inbox` for supported study files. Set `WORKER_USER_ID` in `backend/.env` to the Supabase user id that should own decks created by watched-file imports.

Run the worker:

```bash
cd backend
source .venv/bin/activate
python -m app.worker
```

Drop a `.pdf` or `.txt` file into:

```text
backend/storage/inbox
```

The worker creates a processing job, extracts text, generates cards with Gemini, stores the deck and cards in PostgreSQL, and writes an Anki export under `backend/storage/exports`.

## Verification

Frontend checks:

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

Backend checks:

```bash
cd backend
source .venv/bin/activate
pytest tests
```

Runtime check:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:

```json
{"status":"ok"}
```

## Deployment Notes

- Keep `.env`, `.env.local`, API keys, and database passwords out of git.
- Configure Supabase auth redirect URLs for each deployed frontend origin.
- Use a managed PostgreSQL database in production.
- Replace local file storage with object storage before deploying multi-instance workers.
- Run the watchdog worker as a separate long-running process from the FastAPI API.
