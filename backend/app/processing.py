from sqlalchemy import select
from sqlalchemy.orm import Session

from app import models
from app.ai import AIConfigurationError, AIResponseError, generate_flashcards
from app.config import get_settings
from app.database import SessionLocal
from app.deck_export import export_deck_to_apkg
from app.import_rules import (
    clamp_requested_card_count,
    normalize_deck_title,
    normalize_import_style,
)
from app.job_status import JOB_COMPLETED, JOB_FAILED, JOB_PENDING, JOB_PROCESSING
from app.storage import extract_text, safe_filename


def create_processing_job(
    user_id: str,
    source_filename: str,
    source_path: Path,
    deck_title: str | None,
    requested_card_count: int,
    style: str,
    ai_model: str | None,
) -> models.ProcessingJob:
    with SessionLocal() as db:
        job = models.ProcessingJob(
            user_id=user_id,
            source_filename=safe_filename(source_filename),
            source_path=str(source_path),
            deck_title=deck_title.strip() if deck_title else None,
            requested_card_count=clamp_requested_card_count(requested_card_count),
            style=normalize_import_style(style),
            ai_model=ai_model,
            status=JOB_PENDING,
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job


def process_job_by_id(job_id: str) -> None:
    settings = get_settings()
    with SessionLocal() as db:
        job = db.get(models.ProcessingJob, job_id)
        if not job:
            return

        try:
            job.status = JOB_PROCESSING
            job.error_message = None
            db.commit()

            source_path = Path(job.source_path)
            study_text = extract_text(source_path)
            if not study_text:
                raise ValueError("No readable text was found in the uploaded file.")

            cards = generate_flashcards(
                study_text=study_text,
                card_count=job.requested_card_count,
                style=job.style,
                model=job.ai_model,
            )

            title = normalize_deck_title(job.deck_title, job.source_filename)
            deck = models.Deck(
                user_id=job.user_id,
                title=title,
                description=f"Generated from {job.source_filename}",
                card_count=len(cards),
            )
            db.add(deck)
            db.flush()

            card_rows: list[models.Card] = []
            for index, card in enumerate(cards, start=1):
                row = models.Card(
                    deck_id=deck.id,
                    front_text=card.front_text,
                    back_text=card.back_text,
                    position=index,
                )
                db.add(row)
                card_rows.append(row)
            db.flush()

            export_dir = settings.storage_dir / "exports" / job.user_id
            export_dir.mkdir(parents=True, exist_ok=True)
            output_path = export_dir / f"{deck.id}.apkg"
            export_deck_to_apkg(deck, card_rows, output_path)

            job.deck_id = deck.id
            job.output_path = str(output_path)
            job.status = JOB_COMPLETED
            db.commit()
        except Exception as exc:
            job = db.get(models.ProcessingJob, job_id)
            if job:
                job.status = JOB_FAILED
                if isinstance(exc, (AIConfigurationError, AIResponseError)):
                    job.error_message = str(exc)
                elif exc.__class__.__module__.startswith("google"):
                    job.error_message = (
                        "Gemini request failed. Check the backend Gemini API key "
                        "and model settings, then try again."
                    )
                else:
                    job.error_message = str(exc)
                db.commit()


def list_jobs_for_user(db: Session, user_id: str) -> list[models.ProcessingJob]:
    return list(
        db.scalars(
            select(models.ProcessingJob)
            .where(models.ProcessingJob.user_id == user_id)
            .order_by(models.ProcessingJob.created_at.desc())
        )
    )


def get_job_for_user(
    db: Session, user_id: str, job_id: str
) -> models.ProcessingJob | None:
    return db.scalar(
        select(models.ProcessingJob).where(
            models.ProcessingJob.id == job_id, models.ProcessingJob.user_id == user_id
        )
    )
