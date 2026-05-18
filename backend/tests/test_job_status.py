from app.job_status import (
    ACTIVE_JOB_STATUSES,
    FINISHED_JOB_STATUSES,
    JOB_COMPLETED,
    JOB_FAILED,
    JOB_PENDING,
    JOB_PROCESSING,
    is_finished_status,
)


def test_active_and_finished_statuses_do_not_overlap() -> None:
    assert ACTIVE_JOB_STATUSES == {JOB_PENDING, JOB_PROCESSING}
    assert FINISHED_JOB_STATUSES == {JOB_COMPLETED, JOB_FAILED}
    assert ACTIVE_JOB_STATUSES.isdisjoint(FINISHED_JOB_STATUSES)


def test_is_finished_status_only_matches_terminal_states() -> None:
    assert is_finished_status(JOB_COMPLETED)
    assert is_finished_status(JOB_FAILED)
    assert not is_finished_status(JOB_PENDING)
    assert not is_finished_status(JOB_PROCESSING)
