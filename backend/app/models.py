from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def new_uuid() -> str:
    return str(uuid4())


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class Deck(TimestampMixin, Base):
    __tablename__ = "decks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)
    card_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    cards: Mapped[list[Card]] = relationship(
        back_populates="deck",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Card.position",
    )
    jobs: Mapped[list[ProcessingJob]] = relationship(back_populates="deck")
    study_sessions: Mapped[list[StudySession]] = relationship(back_populates="deck")


class Card(TimestampMixin, Base):
    __tablename__ = "cards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    deck_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("decks.id", ondelete="CASCADE"), index=True, nullable=False
    )
    front_text: Mapped[str] = mapped_column(Text, nullable=False)
    back_text: Mapped[str] = mapped_column(Text, nullable=False)
    position: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    deck: Mapped[Deck] = relationship(back_populates="cards")


class UserSettings(Base):
    __tablename__ = "user_settings"
    __table_args__ = (UniqueConstraint("user_id", name="uq_user_settings_user_id"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    shuffle_enabled: Mapped[bool] = mapped_column(default=True, nullable=False)
    daily_goal: Mapped[int | None] = mapped_column(Integer, default=20)
    default_ai_card_count: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    default_ai_style: Mapped[str] = mapped_column(String(40), default="concise", nullable=False)
    ai_model: Mapped[str] = mapped_column(
        String(80), default="gemini-2.5-flash-lite", nullable=False
    )
    cards_per_session: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    theme: Mapped[str] = mapped_column(String(40), default="ocean", nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )


class StudySession(Base):
    __tablename__ = "study_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    deck_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("decks.id", ondelete="SET NULL"), nullable=True
    )
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    known_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    deck: Mapped[Deck | None] = relationship(back_populates="study_sessions")


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    deck_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("decks.id", ondelete="SET NULL"), nullable=True
    )
    source_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    source_path: Mapped[str] = mapped_column(Text, nullable=False)
    output_path: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(40), default="pending", index=True)
    error_message: Mapped[str | None] = mapped_column(Text)
    deck_title: Mapped[str | None] = mapped_column(String(200))
    requested_card_count: Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    style: Mapped[str] = mapped_column(String(40), default="concise", nullable=False)
    ai_model: Mapped[str | None] = mapped_column(String(80))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False
    )

    deck: Mapped[Deck | None] = relationship(back_populates="jobs")

