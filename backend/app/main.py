from pathlib import Path

from fastapi import BackgroundTasks, Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app import crud, models
from app.ai import AIConfigurationError, AIResponseError, generate_flashcards
from app.auth import get_current_user
from app.config import Settings, get_settings
from app.database import SessionLocal, get_db, init_db
from app.deck_export import export_deck_to_apkg
from app.import_rules import clamp_requested_card_count, normalize_import_style
from app.processing import (
    create_processing_job,
    get_job_for_user,
    list_jobs_for_user,
    process_job_by_id,
)
from app.schemas import (
    AuthUser,
    BulkCardsCreate,
    CardCreate,
    CardOut,
    CardUpdate,
    DeckCreate,
    DeckOut,
    DeckUpdate,
    GenerateCardsRequest,
    GenerateCardsResponse,
    ProcessingJobOut,
    SettingsOut,
    SettingsUpdate,
    StudySessionCreate,
    StudySessionOut,
)
from app.storage import ensure_supported_file, save_upload


settings = get_settings()
app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/settings", response_model=SettingsOut)
def get_settings_route(
    user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)
) -> models.UserSettings:
    return crud.get_or_create_settings(db, user.id)


@app.patch("/api/settings", response_model=SettingsOut)
def update_settings_route(
    payload: SettingsUpdate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.UserSettings:
    return crud.update_settings(db, user.id, payload)


@app.get("/api/decks", response_model=list[DeckOut])
def list_decks_route(
    user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[models.Deck]:
    return crud.list_decks(db, user.id)


@app.post("/api/decks", response_model=DeckOut, status_code=201)
def create_deck_route(
    payload: DeckCreate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.Deck:
    return crud.create_deck(db, user.id, payload)


@app.patch("/api/decks/{deck_id}", response_model=DeckOut)
def update_deck_route(
    deck_id: str,
    payload: DeckUpdate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.Deck:
    return crud.update_deck(db, user.id, deck_id, payload)


@app.delete("/api/decks/{deck_id}", status_code=204)
def delete_deck_route(
    deck_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    crud.delete_deck(db, user.id, deck_id)


@app.get("/api/decks/{deck_id}/cards", response_model=list[CardOut])
def list_cards_route(
    deck_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[models.Card]:
    return crud.list_cards(db, user.id, deck_id)


@app.post("/api/decks/{deck_id}/cards", response_model=CardOut, status_code=201)
def create_card_route(
    deck_id: str,
    payload: CardCreate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.Card:
    return crud.create_card(db, user.id, deck_id, payload)


@app.post("/api/decks/{deck_id}/cards/bulk", response_model=list[CardOut], status_code=201)
def create_cards_bulk_route(
    deck_id: str,
    payload: BulkCardsCreate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[models.Card]:
    return crud.create_cards_bulk(db, user.id, deck_id, payload)


@app.patch("/api/cards/{card_id}", response_model=CardOut)
def update_card_route(
    card_id: str,
    payload: CardUpdate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.Card:
    return crud.update_card(db, user.id, card_id, payload)


@app.delete("/api/cards/{card_id}", status_code=204)
def delete_card_route(
    card_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    crud.delete_card(db, user.id, card_id)


@app.get("/api/study-sessions", response_model=list[StudySessionOut])
def list_study_sessions_route(
    user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[models.StudySession]:
    return crud.list_study_sessions(db, user.id)


@app.post("/api/study-sessions", response_model=StudySessionOut, status_code=201)
def create_study_session_route(
    payload: StudySessionCreate,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.StudySession:
    return crud.create_study_session(db, user.id, payload)


@app.post("/api/generate-cards", response_model=GenerateCardsResponse)
def generate_cards_route(
    payload: GenerateCardsRequest,
    _user: AuthUser = Depends(get_current_user),
) -> GenerateCardsResponse:
    try:
        cards = generate_flashcards(
            study_text=payload.studyText,
            card_count=payload.cardCount,
            style=payload.style,
            model=payload.model,
        )
    except AIConfigurationError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
    except AIResponseError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Gemini request failed.") from exc
    return GenerateCardsResponse(cards=cards)


@app.post("/api/imports/upload", response_model=ProcessingJobOut, status_code=202)
async def upload_import_route(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    deck_title: str = Form(""),
    card_count: int = Form(10),
    style: str = Form("concise"),
    model: str | None = Form(None),
    user: AuthUser = Depends(get_current_user),
) -> models.ProcessingJob:
    ensure_supported_file(file.filename or "")
    job = create_processing_job(
        user_id=user.id,
        source_filename=file.filename or "study-file",
        source_path=Path("pending"),
        deck_title=deck_title or None,
        requested_card_count=clamp_requested_card_count(card_count),
        style=normalize_import_style(style),
        ai_model=model,
    )
    source_path = await save_upload(file, user.id, job.id)

    with SessionLocal() as db:
        db_job = db.get(models.ProcessingJob, job.id)
        if not db_job:
            raise HTTPException(status_code=404, detail="Import job not found.")
        db_job.source_path = str(source_path)
        db.commit()
        db.refresh(db_job)
        job = db_job

    background_tasks.add_task(process_job_by_id, job.id)
    return job


@app.get("/api/imports/jobs", response_model=list[ProcessingJobOut])
def list_import_jobs_route(
    user: AuthUser = Depends(get_current_user), db: Session = Depends(get_db)
) -> list[models.ProcessingJob]:
    return list_jobs_for_user(db, user.id)


@app.get("/api/imports/jobs/{job_id}", response_model=ProcessingJobOut)
def get_import_job_route(
    job_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> models.ProcessingJob:
    job = get_job_for_user(db, user.id, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Import job not found.")
    return job


@app.get("/api/decks/{deck_id}/export")
def export_deck_route(
    deck_id: str,
    user: AuthUser = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FileResponse:
    deck = crud.get_deck_or_404(db, user.id, deck_id)
    cards = crud.list_cards(db, user.id, deck_id)
    if not cards:
        raise HTTPException(status_code=400, detail="Deck has no cards to export.")
    output_path = export_deck_to_apkg(deck, cards)
    return FileResponse(
        output_path,
        media_type="application/octet-stream",
        filename=f"{deck.title}.apkg",
    )
