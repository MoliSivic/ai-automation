# Project Handoff

This handoff summarizes the backend pipeline, operating requirements, and verification steps for FlashGenius.

## Backend Pipeline

The backend turns study material into saved flashcard decks and Anki exports:

```text
PDF/TXT source
-> upload or watched inbox
-> processing job
-> text extraction
-> Gemini flashcard generation
-> PostgreSQL deck and card records
-> Anki .apkg export
```

## Main Services

- `backend/app/main.py` exposes the FastAPI routes for settings, decks, cards, study sessions, generation, imports, job polling, and exports.
- `backend/app/processing.py` runs import jobs and coordinates text extraction, card generation, persistence, and export creation.
- `backend/app/storage.py` validates supported files, stores uploads, sanitizes filenames, and extracts TXT/PDF text.
- `backend/app/import_rules.py` centralizes import limits, style choices, and deck-title normalization.
- `backend/app/job_status.py` defines the processing job lifecycle states.
- `backend/app/worker.py` watches `backend/storage/inbox` for local PDF/TXT automation.

## Import Rules

- Supported files are PDF and TXT.
- Requested card counts are clamped from 1 to 30.
- Supported styles are `concise`, `detailed`, `simple`, and `academic`.
- Unknown styles fall back to `concise`.
- Missing deck titles fall back to the source filename.
- Imported deck descriptions include source filename context and extracted word counts.

## Required Environment

Frontend:

```bash
NEXT_PUBLIC_API_BASE_URL=/backend
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Backend:

```bash
DATABASE_URL=postgresql+psycopg://postgres:your-password@localhost:5432/ai-automation-db
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
GEMINI_API_KEY=your-gemini-api-key
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Worker automation:

```bash
WORKER_USER_ID=your-supabase-user-id
WORKER_CARD_COUNT=20
```

## Verification

Backend:

```bash
cd backend
source .venv/bin/activate
pytest tests
curl http://127.0.0.1:8000/health
```

Frontend:

```bash
cd frontend
npm run lint
npx tsc --noEmit
npm run build
```

## Handoff Notes

- Keep secrets in local environment files only.
- Configure Supabase redirect URLs before deployment.
- Use managed PostgreSQL for production.
- Replace local file storage with object storage before running multiple backend instances.
- Run the worker separately from the FastAPI API when watched-folder imports are needed.
- Confirm the import page drag-and-drop area accepts PDFs/TXT files and shows processing status before demo or release.
