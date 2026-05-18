import re


WORD_PATTERN = re.compile(r"\b[\w'-]+\b")


def count_words(text: str) -> int:
    return len(WORD_PATTERN.findall(text))


def build_source_description(filename: str, study_text: str) -> str:
    word_count = count_words(study_text)
    if word_count:
        return f"Generated from {filename} ({word_count} words extracted)"
    return f"Generated from {filename}"
