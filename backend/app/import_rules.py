from pathlib import Path


IMPORT_CARD_COUNT_MIN = 1
IMPORT_CARD_COUNT_MAX = 30
DEFAULT_IMPORT_STYLE = "concise"
ALLOWED_IMPORT_STYLES = {"concise", "detailed", "simple", "academic"}


def clamp_requested_card_count(card_count: int) -> int:
    return max(IMPORT_CARD_COUNT_MIN, min(card_count, IMPORT_CARD_COUNT_MAX))


def normalize_import_style(style: str | None) -> str:
    if style in ALLOWED_IMPORT_STYLES:
        return style
    return DEFAULT_IMPORT_STYLE


def normalize_deck_title(deck_title: str | None, fallback_filename: str) -> str:
    title = deck_title.strip() if deck_title else ""
    if not title:
        title = Path(fallback_filename).stem.replace("_", " ").replace("-", " ").strip()
    return (title or "Imported deck")[:200]
