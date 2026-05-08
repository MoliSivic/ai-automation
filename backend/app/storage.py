import re
from pathlib import Path

from fastapi import HTTPException, UploadFile, status
from pypdf import PdfReader

from app.config import get_settings


SUPPORTED_EXTENSIONS = {".pdf", ".txt"}


def safe_filename(filename: str) -> str:
    base = Path(filename).name.strip() or "study-file"
    return re.sub(r"[^A-Za-z0-9._-]+", "_", base)


def ensure_supported_file(filename: str) -> None:
    if Path(filename).suffix.lower() not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and TXT files are supported.",
        )


async def save_upload(file: UploadFile, user_id: str, job_id: str) -> Path:
    settings = get_settings()
    ensure_supported_file(file.filename or "")
    filename = safe_filename(file.filename or "study-file")
    user_dir = settings.storage_dir / "uploads" / user_id
    user_dir.mkdir(parents=True, exist_ok=True)
    destination = user_dir / f"{job_id}_{filename}"

    size = 0
    with destination.open("wb") as output:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > settings.max_upload_size_bytes:
                destination.unlink(missing_ok=True)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Upload exceeds {settings.max_upload_size_mb} MB.",
                )
            output.write(chunk)

    return destination


def extract_text(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix == ".txt":
        return path.read_text(encoding="utf-8", errors="ignore").strip()

    if suffix == ".pdf":
        reader = PdfReader(str(path))
        pages = [page.extract_text() or "" for page in reader.pages]
        return "\n\n".join(page.strip() for page in pages if page.strip()).strip()

    raise ValueError("Unsupported file type.")

