from typing import Literal


ProcessingStatus = Literal["pending", "processing", "completed", "failed"]

JOB_PENDING: ProcessingStatus = "pending"
JOB_PROCESSING: ProcessingStatus = "processing"
JOB_COMPLETED: ProcessingStatus = "completed"
JOB_FAILED: ProcessingStatus = "failed"

ACTIVE_JOB_STATUSES = {JOB_PENDING, JOB_PROCESSING}
FINISHED_JOB_STATUSES = {JOB_COMPLETED, JOB_FAILED}


def is_finished_status(status: str) -> bool:
    return status in FINISHED_JOB_STATUSES
