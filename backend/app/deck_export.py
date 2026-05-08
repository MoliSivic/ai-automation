from hashlib import sha256
from html import escape
from pathlib import Path
from typing import Iterable

from app import models
from app.config import get_settings


def stable_genanki_id(value: str) -> int:
    digest = sha256(value.encode("utf-8")).hexdigest()
    return int(digest[:8], 16)


def export_deck_to_apkg(
    deck: models.Deck,
    cards: Iterable[models.Card],
    output_path: Path | None = None,
) -> Path:
    import genanki

    settings = get_settings()
    export_dir = settings.storage_dir / "exports" / deck.user_id
    export_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_path or export_dir / f"{deck.id}.apkg"

    model = genanki.Model(
        stable_genanki_id("flashgenius-basic-model"),
        "FlashGenius Basic Card",
        fields=[{"name": "Front"}, {"name": "Back"}],
        templates=[
            {
                "name": "Card 1",
                "qfmt": "{{Front}}",
                "afmt": '{{FrontSide}}<hr id="answer">{{Back}}',
            }
        ],
    )
    genanki_deck = genanki.Deck(stable_genanki_id(f"deck:{deck.id}"), deck.title)

    for card in cards:
        genanki_deck.add_note(
            genanki.Note(
                model=model,
                fields=[escape(card.front_text), escape(card.back_text)],
                guid=card.id,
            )
        )

    genanki.Package(genanki_deck).write_to_file(str(output_path))
    return output_path

