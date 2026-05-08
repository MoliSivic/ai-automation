from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class AuthUser(BaseModel):
    id: str
    email: str = ""
    full_name: str = ""


class DeckCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = ""


class DeckUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = None


class DeckOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    title: str
    description: str
    card_count: int
    created_at: datetime
    updated_at: datetime


class CardCreate(BaseModel):
    front_text: str = Field(min_length=1)
    back_text: str = Field(min_length=1)
    position: int | None = None


class CardUpdate(BaseModel):
    front_text: str = Field(min_length=1)
    back_text: str = Field(min_length=1)


class CardOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    deck_id: str
    front_text: str
    back_text: str
    position: int
    created_at: datetime
    updated_at: datetime


class BulkCardsCreate(BaseModel):
    cards: list[CardCreate]


class SettingsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    shuffle_enabled: bool
    daily_goal: int | None
    default_ai_card_count: int
    default_ai_style: str
    ai_model: str
    cards_per_session: int
    theme: str
    updated_at: datetime


class SettingsUpdate(BaseModel):
    shuffle_enabled: bool | None = None
    daily_goal: int | None = None
    default_ai_card_count: int | None = Field(default=None, ge=1, le=50)
    default_ai_style: str | None = None
    ai_model: str | None = None
    cards_per_session: int | None = Field(default=None, ge=1, le=100)
    theme: str | None = None


class StudySessionCreate(BaseModel):
    deck_id: str
    known_count: int = Field(ge=0)
    total_count: int = Field(ge=0)


class StudySessionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    deck_id: str | None
    started_at: datetime
    ended_at: datetime | None
    known_count: int
    total_count: int


class GenerateCardsRequest(BaseModel):
    studyText: str = Field(min_length=1)
    cardCount: int = Field(default=10, ge=1, le=30)
    style: str = "concise"
    model: str | None = None


class GeneratedCard(BaseModel):
    front_text: str
    back_text: str
    position: int


class GenerateCardsResponse(BaseModel):
    cards: list[GeneratedCard]


class ProcessingJobOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    deck_id: str | None
    source_filename: str
    status: str
    error_message: str | None
    deck_title: str | None
    requested_card_count: int
    style: str
    ai_model: str | None
    created_at: datetime
    updated_at: datetime

