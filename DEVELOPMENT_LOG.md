# Development Log

This log summarizes the project development process for the FlashGenius frontend and backend during the May 5-21, 2026 build window. It is a human-readable milestone record; the Git commit log remains the source of truth for exact repository history.

## Timeline

1. **May 5, 2026 - Product scope**
   Defined FlashGenius as an AI-assisted study tool that turns notes and files into review-ready flashcard decks.

2. **May 6, 2026 - Frontend foundation**
   Set up the Next.js frontend structure with TypeScript, Tailwind CSS, shared layout, routing, and baseline application styles.

3. **May 7, 2026 - UI primitives**
   Added reusable UI building blocks for buttons, inputs, dialogs, dropdowns, drawers, progress indicators, and toast notifications.

4. **May 8, 2026 - Mock data flow**
   Introduced mock deck and card data so dashboard, deck, and study screens could be developed before the backend was ready.

5. **May 9, 2026 - Deck management**
   Built the main deck workflows for listing decks, creating new decks, editing deck details, and viewing individual deck cards.

6. **May 10, 2026 - Study experience**
   Implemented the study session flow with card navigation, answer reveal behavior, progress tracking, and session completion handling.

7. **May 11, 2026 - Authentication screens**
   Added login, signup, forgot-password, reset-password, and auth callback routes to prepare the app for Supabase authentication.

8. **May 12, 2026 - Supabase integration**
   Connected Supabase browser, server, and middleware helpers for authenticated frontend sessions and protected navigation.

9. **May 13, 2026 - Dashboard and settings**
   Expanded the authenticated app with dashboard metrics, settings controls, dark mode behavior, and user-facing account flows.

10. **May 14, 2026 - AI generation UI**
    Built the AI generation page where users can paste study text, choose card count and style, and create draft flashcards.

11. **May 15, 2026 - AI request contract**
    Shaped the frontend/backend contract for flashcard generation, including request payloads, response card structures, and error handling.

12. **May 16, 2026 - Persistence model**
    Planned the database entities for users, decks, cards, study sessions, user settings, and import processing jobs.

13. **May 17, 2026 - Backend scaffold**
    Added the FastAPI backend structure with app configuration, database setup, schemas, models, and application entry point.

14. **May 18, 2026 - CRUD and auth API**
    Implemented authenticated API routes for deck, card, settings, and study session operations using SQLAlchemy and Supabase auth.

15. **May 19, 2026 - File processing pipeline**
    Added PDF/TXT storage, text extraction, processing jobs, Gemini flashcard generation, and Anki package export support.

16. **May 20, 2026 - Frontend/backend split**
    Organized the repository into `frontend/` and `backend/`, documented each side, and connected the Next.js app to the FastAPI service.

17. **May 20, 2026 - Import upload workflow**
    Added the import page flow for uploading study files, configuring deck title/card count/style, and monitoring processing progress.

18. **May 21, 2026 - Proxy and environment cleanup**
    Refined backend proxy handling, environment examples, auth initialization, and local development setup notes.

19. **May 21, 2026 - Visual polish**
    Improved icons, import upload UI states, dark mode card contrast, and page-level styling consistency across the frontend.

20. **May 21, 2026 - Final verification pass**
    Reviewed the README instructions, backend health check, test commands, and deployment notes so the project is easier to run and present.

## Added Commit Notes

These final commits document the extra project work added after the core app was already running:

- **May 18, 2026 - `feat: improve import upload feedback`**
  Added frontend validation for PDF/TXT uploads, a 20 MB file limit message, clearer import status labels, selected-file feedback, and generated-card request details.

- **May 19, 2026 - `feat: centralize import job helpers`**
  Moved import card-count limits, style normalization, deck-title cleanup, and job lookup helpers into the backend processing layer so uploads and watched inbox jobs share the same rules.

- **May 20, 2026 - `test: cover import processing helpers`**
  Added backend tests for import limits, style fallback, deck-title cleanup, safe filename handling, supported file validation, TXT extraction, and pytest path configuration.

- **May 21, 2026 - `docs: document final project additions`**
  Updated the README and development log so the final additions, their dates, and their purpose are easy to explain alongside the Git history.

## Current Architecture

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS, Supabase auth helpers.
- **Backend:** FastAPI, SQLAlchemy, Pydantic, PostgreSQL, Supabase token verification.
- **AI generation:** Gemini API for flashcard creation.
- **File automation:** Local uploads, watched inbox processing, PDF/TXT extraction, and background processing jobs.
- **Export:** Anki `.apkg` generation through `genanki`.

## Presentation Notes

- The project now includes both a user-facing flashcard app and a backend automation pipeline.
- Frontend work focused on authentication, deck management, study sessions, AI generation, import flows, and dark mode polish.
- Backend work focused on API contracts, persistence, auth protection, file processing, AI integration, and export generation.
