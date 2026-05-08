from app.ai import parse_cards_json


def test_parse_cards_json_accepts_code_fences() -> None:
    cards = parse_cards_json(
        """```json
        [
          {"front_text": "What is pypdf?", "back_text": "A Python PDF parser."}
        ]
        ```"""
    )

    assert cards[0].front_text == "What is pypdf?"
    assert cards[0].position == 0


def test_parse_cards_json_accepts_front_back_aliases() -> None:
    cards = parse_cards_json('[{"front": "Q", "back": "A"}]')

    assert cards[0].front_text == "Q"
    assert cards[0].back_text == "A"

