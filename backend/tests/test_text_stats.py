from app.text_stats import build_source_description, count_words


def test_count_words_handles_basic_study_text() -> None:
    assert count_words("Cells divide through mitosis and cytokinesis.") == 6


def test_count_words_handles_empty_text() -> None:
    assert count_words("   ") == 0


def test_build_source_description_includes_word_count() -> None:
    description = build_source_description(
        "biology-notes.txt",
        "Mitochondria make ATP for cells.",
    )

    assert description == "Generated from biology-notes.txt (5 words extracted)"


def test_build_source_description_omits_zero_word_count() -> None:
    assert build_source_description("empty.txt", "") == "Generated from empty.txt"
