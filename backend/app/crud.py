from datetime import timezone

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app import models
from app.schemas import (
    BulkCardsCreate,
    CardCreate,
    CardUpdate,
    DeckCreate,
    DeckUpdate,
    SettingsUpdate,
    StudySessionCreate,
)


def get_or_create_settings(db: Session, user_id: str) -> models.UserSettings:
    settings = db.scalar(
        select(models.UserSettings).where(models.UserSettings.user_id == user_id)
    )
    if settings:
        return settings

    settings = models.UserSettings(user_id=user_id)
    db.add(settings)
    db.commit()
    db.refresh(settings)
    return settings


def update_settings(
    db: Session, user_id: str, payload: SettingsUpdate
) -> models.UserSettings:
    settings = get_or_create_settings(db, user_id)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings


def list_decks(db: Session, user_id: str) -> list[models.Deck]:
    return list(
        db.scalars(
            select(models.Deck)
            .where(models.Deck.user_id == user_id)
            .order_by(models.Deck.created_at.desc())
        )
    )


def create_deck(db: Session, user_id: str, payload: DeckCreate) -> models.Deck:
    deck = models.Deck(
        user_id=user_id,
        title=payload.title.strip(),
        description=payload.description.strip(),
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)
    return deck


def get_deck_or_404(db: Session, user_id: str, deck_id: str) -> models.Deck:
    deck = db.scalar(
        select(models.Deck).where(models.Deck.id == deck_id, models.Deck.user_id == user_id)
    )
    if not deck:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Deck not found.")
    return deck


def update_deck(
    db: Session, user_id: str, deck_id: str, payload: DeckUpdate
) -> models.Deck:
    deck = get_deck_or_404(db, user_id, deck_id)
    updates = payload.model_dump(exclude_unset=True)
    if "title" in updates and updates["title"] is not None:
        deck.title = updates["title"].strip()
    if "description" in updates and updates["description"] is not None:
        deck.description = updates["description"].strip()
    db.commit()
    db.refresh(deck)
    return deck


def delete_deck(db: Session, user_id: str, deck_id: str) -> None:
    deck = get_deck_or_404(db, user_id, deck_id)
    db.delete(deck)
    db.commit()


def list_cards(db: Session, user_id: str, deck_id: str) -> list[models.Card]:
    get_deck_or_404(db, user_id, deck_id)
    return list(
        db.scalars(
            select(models.Card)
            .where(models.Card.deck_id == deck_id)
            .order_by(models.Card.position.asc(), models.Card.created_at.asc())
        )
    )


def next_card_position(db: Session, deck_id: str) -> int:
    current_max = db.scalar(
        select(func.max(models.Card.position)).where(models.Card.deck_id == deck_id)
    )
    return int(current_max or 0) + 1


def sync_deck_card_count(db: Session, deck: models.Deck) -> None:
    deck.card_count = int(
        db.scalar(select(func.count(models.Card.id)).where(models.Card.deck_id == deck.id))
        or 0
    )


def create_card(
    db: Session, user_id: str, deck_id: str, payload: CardCreate
) -> models.Card:
    deck = get_deck_or_404(db, user_id, deck_id)
    position = payload.position or next_card_position(db, deck_id)
    card = models.Card(
        deck_id=deck.id,
        front_text=payload.front_text.strip(),
        back_text=payload.back_text.strip(),
        position=position,
    )
    db.add(card)
    db.flush()
    sync_deck_card_count(db, deck)
    db.commit()
    db.refresh(card)
    return card


def create_cards_bulk(
    db: Session, user_id: str, deck_id: str, payload: BulkCardsCreate
) -> list[models.Card]:
    deck = get_deck_or_404(db, user_id, deck_id)
    position = next_card_position(db, deck_id)
    cards: list[models.Card] = []
    for index, item in enumerate(payload.cards):
        card = models.Card(
            deck_id=deck.id,
            front_text=item.front_text.strip(),
            back_text=item.back_text.strip(),
            position=item.position or position + index,
        )
        db.add(card)
        cards.append(card)
    db.flush()
    sync_deck_card_count(db, deck)
    db.commit()
    for card in cards:
        db.refresh(card)
    return cards


def get_card_for_user(db: Session, user_id: str, card_id: str) -> models.Card:
    card = db.scalar(
        select(models.Card)
        .join(models.Deck)
        .where(models.Card.id == card_id, models.Deck.user_id == user_id)
    )
    if not card:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Card not found.")
    return card


def update_card(
    db: Session, user_id: str, card_id: str, payload: CardUpdate
) -> models.Card:
    card = get_card_for_user(db, user_id, card_id)
    card.front_text = payload.front_text.strip()
    card.back_text = payload.back_text.strip()
    db.commit()
    db.refresh(card)
    return card


def delete_card(db: Session, user_id: str, card_id: str) -> None:
    card = get_card_for_user(db, user_id, card_id)
    deck = card.deck
    db.delete(card)
    db.flush()
    sync_deck_card_count(db, deck)
    db.commit()


def list_study_sessions(db: Session, user_id: str) -> list[models.StudySession]:
    return list(
        db.scalars(
            select(models.StudySession)
            .where(models.StudySession.user_id == user_id)
            .order_by(models.StudySession.started_at.desc())
        )
    )


def create_study_session(
    db: Session, user_id: str, payload: StudySessionCreate
) -> models.StudySession:
    get_deck_or_404(db, user_id, payload.deck_id)
    now = models.utc_now().astimezone(timezone.utc)
    session = models.StudySession(
        user_id=user_id,
        deck_id=payload.deck_id,
        started_at=now,
        ended_at=now,
        known_count=payload.known_count,
        total_count=payload.total_count,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

