import time
from pathlib import Path

from watchdog.events import FileSystemEvent, FileSystemEventHandler
from watchdog.observers import Observer

from app.config import get_settings
from app.database import init_db
from app.processing import (
    DEFAULT_IMPORT_STYLE,
    clamp_requested_card_count,
    create_processing_job,
    normalize_deck_title,
    process_job_by_id,
)
from app.storage import SUPPORTED_EXTENSIONS


def wait_until_file_is_stable(path: Path, timeout: int = 30) -> bool:
    previous_size = -1
    started_at = time.time()
    while time.time() - started_at < timeout:
        if not path.exists():
            return False
        current_size = path.stat().st_size
        if current_size > 0 and current_size == previous_size:
            return True
        previous_size = current_size
        time.sleep(1)
    return False


class InboxHandler(FileSystemEventHandler):
    def __init__(self, user_id: str) -> None:
        self.user_id = user_id

    def on_created(self, event: FileSystemEvent) -> None:
        if event.is_directory:
            return
        self.process_path(Path(event.src_path))

    def process_path(self, path: Path) -> None:
        if path.suffix.lower() not in SUPPORTED_EXTENSIONS:
            return
        if not wait_until_file_is_stable(path):
            return

        settings = get_settings()
        job = create_processing_job(
            user_id=self.user_id,
            source_filename=path.name,
            source_path=path,
            deck_title=normalize_deck_title(None, path.name),
            requested_card_count=clamp_requested_card_count(settings.worker_card_count),
            style=DEFAULT_IMPORT_STYLE,
            ai_model=settings.gemini_model,
        )
        process_job_by_id(job.id)


def main() -> None:
    settings = get_settings()
    if not settings.worker_user_id:
        raise SystemExit("WORKER_USER_ID must be set before running the watcher.")

    init_db()
    inbox = settings.storage_dir / "inbox"
    inbox.mkdir(parents=True, exist_ok=True)

    handler = InboxHandler(settings.worker_user_id)
    for existing in inbox.iterdir():
        if existing.is_file():
            handler.process_path(existing)

    observer = Observer()
    observer.schedule(handler, str(inbox), recursive=False)
    observer.start()
    print(f"Watching {inbox} for PDF/TXT files...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()


if __name__ == "__main__":
    main()
