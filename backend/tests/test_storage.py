from pathlib import Path

import pytest
from fastapi import HTTPException

from app.storage import ensure_supported_file, extract_text, safe_filename


def test_safe_filename_removes_paths_and_unsafe_characters() -> None:
    assert safe_filename("../Lecture Notes #1!.pdf") == "Lecture_Notes_1_.pdf"


def test_ensure_supported_file_accepts_pdf_and_txt() -> None:
    ensure_supported_file("notes.pdf")
    ensure_supported_file("notes.txt")


def test_ensure_supported_file_rejects_unsupported_extensions() -> None:
    with pytest.raises(HTTPException) as exc_info:
        ensure_supported_file("notes.md")

    assert exc_info.value.status_code == 400
    assert "PDF and TXT" in exc_info.value.detail


def test_extract_text_reads_txt_files(tmp_path: Path) -> None:
    source = tmp_path / "notes.txt"
    source.write_text("  Photosynthesis makes glucose.  ", encoding="utf-8")

    assert extract_text(source) == "Photosynthesis makes glucose."
