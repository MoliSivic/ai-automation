import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ALLOWED_MODELS = ["gemini-2.5-flash-lite", "gemma-3-4b-it"];

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

export async function POST(req: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key not configured." },
      { status: 500 },
    );
  }

  const { studyText, cardCount, style, model } = await req.json();

  const resolvedModel = ALLOWED_MODELS.includes(model) ? model : DEFAULT_MODEL;
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${resolvedModel}:generateContent`;

  if (!studyText || typeof studyText !== "string") {
    return NextResponse.json(
      { error: "studyText is required." },
      { status: 400 },
    );
  }

  const styleGuide: Record<string, string> = {
    concise: "short, punchy questions with brief answers (1-2 sentences max)",
    detailed: "thorough questions with comprehensive answers (3-5 sentences)",
    simple:
      "very simple, beginner-friendly questions with plain-language answers",
    academic: "formal academic-style questions with precise, technical answers",
  };

  const styleDesc = styleGuide[style] ?? styleGuide["concise"];
  const count = Math.min(Math.max(Number(cardCount) || 10, 1), 30);

  const prompt = `You are a flashcard generation expert. Given the study material below, generate exactly ${count} high-quality flashcards.

Style: ${styleDesc}

Rules:
- Each card must have a clear "front" (question/term) and "back" (answer/definition)
- Do NOT number the cards
- Cover the most important concepts in the text
- Avoid duplicate or trivial cards
- Respond ONLY with a valid JSON array — no markdown, no explanation, no code fences

Output format:
[
  { "front_text": "...", "back_text": "..." },
  ...
]

Study Material:
${studyText}`;

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => null);
    const errMessage = errData?.error?.message ?? "Gemini API request failed.";
    console.error("Gemini API error:", errMessage);

    if (response.status === 429) {
      return NextResponse.json(
        {
          error:
            "AI quota exceeded. Please check your Gemini API plan or try again later.",
        },
        { status: 429 },
      );
    }
    if (response.status === 400) {
      return NextResponse.json(
        { error: `Invalid request: ${errMessage}` },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: errMessage }, { status: 502 });
  }

  const data = await response.json();
  const rawText: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  // Strip any accidental markdown code fences
  const cleaned = rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  let cards: { front_text: string; back_text: string }[];
  try {
    cards = JSON.parse(cleaned);
  } catch {
    console.error("Failed to parse Gemini response:", cleaned);
    return NextResponse.json(
      { error: "Failed to parse AI response. Please try again." },
      { status: 500 },
    );
  }

  // Attach position index
  const result = cards.map((card, i) => ({
    front_text: card.front_text,
    back_text: card.back_text,
    position: i,
  }));

  return NextResponse.json({ cards: result });
}
