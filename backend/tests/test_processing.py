from app.processing import (
    DEFAULT_IMPORT_STYLE,
    clamp_requested_card_count,
    normalize_deck_title,
    normalize_import_style,
)


def test_clamp_requested_card_count_keeps_import_limits() -> None:
    assert clamp_requested_card_count(0) == 1
    assert clamp_requested_card_count(12) == 12
    assert clamp_requested_card_count(60) == 30


def test_normalize_import_style_falls_back_to_default() -> None:
    assert normalize_import_style("academic") == "academic"
    assert normalize_import_style("unknown") == DEFAULT_IMPORT_STYLE
    assert normalize_import_style(None) == DEFAULT_IMPORT_STYLE


def test_normalize_deck_title_uses_clean_filename_fallback() -> None:
    assert normalize_deck_title("", "chapter-one_notes.pdf") == "chapter one notes"
    assert normalize_deck_title("  Biology Quiz  ", "notes.pdf") == "Biology Quiz"


def test_normalize_deck_title_limits_length() -> None:
    assert len(normalize_deck_title("A" * 250, "notes.pdf")) == 200
