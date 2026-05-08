import json
import re

from app.config import get_settings
from app.schemas import GeneratedCard


STYLE_GUIDE = {
    "concise": "short, punchy questions with brief answers",
    "detailed": "thorough questions with comprehensive answers",
    "simple": "beginner-friendly questions with plain-language answers",
    "academic": "formal academic-style questions with precise, technical answers",
}


class AIConfigurationError(RuntimeError):
    pass


class AIResponseError(RuntimeError):
    pass


def build_prompt(study_text: str, card_count: int, style: str) -> str:
    style_desc = STYLE_GUIDE.get(style, STYLE_GUIDE["concise"])
    return f"""You are a flashcard generation expert. Given the study material below, generate exactly {card_count} high-quality flashcards.

Style: {style_desc}

Rules:
- Each card must have a clear "front" question or term and a clear "back" answer or definition.
- Do not number the cards.
- Cover the most important concepts in the text.
- Avoid duplicate, trivial, or overly broad cards.
- Respond only with a valid JSON array. Do not include markdown, commentary, or code fences.

Output format:
[
  {{ "front_text": "...", "back_text": "..." }}
]

Study Material:
{study_text}
"""


def parse_cards_json(raw_text: str) -> list[GeneratedCard]:
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    match = re.search(r"\[[\s\S]*\]", cleaned)
    if match:
        cleaned = match.group(0)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError as exc:
        raise AIResponseError("Gemini returned invalid JSON.") from exc

    if not isinstance(parsed, list):
        raise AIResponseError("Gemini response was not a JSON array.")

    cards: list[GeneratedCard] = []
    for index, item in enumerate(parsed):
        if not isinstance(item, dict):
            continue
        front = str(item.get("front_text") or item.get("front") or "").strip()
        back = str(item.get("back_text") or item.get("back") or "").strip()
        if front and back:
            cards.append(GeneratedCard(front_text=front, back_text=back, position=index))

    if not cards:
        raise AIResponseError("Gemini did not return usable flashcards.")
    return cards


def generate_flashcards(
    study_text: str,
    card_count: int = 10,
    style: str = "concise",
    model: str | None = None,
) -> list[GeneratedCard]:
    settings = get_settings()
    if not settings.gemini_api_key:
        raise AIConfigurationError("Gemini API key is not configured.")

    selected_model = model or settings.gemini_model
    if selected_model not in settings.allowed_model_list:
        selected_model = settings.gemini_model

    from google import genai
    from google.genai import types

    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model=selected_model,
        contents=build_prompt(study_text, card_count, style),
        config=types.GenerateContentConfig(
            temperature=0.7,
            max_output_tokens=4096,
            response_mime_type="application/json",
        ),
    )
    raw_text = getattr(response, "text", "") or ""
    return parse_cards_json(raw_text)
