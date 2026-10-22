import json
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

API_KEY = os.getenv("OPENAI_API_KEY")
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def analyze_journal_entry(content: str) -> dict:
    """Analyze an entry with the configured LLM.

    The client is created only when this function is called, so the API
    can still start when an AI key has not been configured yet.
    """
    if not API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    client = OpenAI(api_key=API_KEY)

    prompt = f"""
Analyze the following personal journal entry.

Return ONLY valid JSON with exactly these keys:
{{
  "mood": "happy|sad|angry|anxious|calm|excited|neutral",
  "sentiment_score": 0.0,
  "confidence": 0.0,
  "themes": ["theme1", "theme2"],
  "summary": "short summary",
  "reflection": "supportive reflection"
}}

Rules:
- sentiment_score must be between -1 and 1.
- confidence must be between 0 and 1.
- themes must contain 1 to 5 concise strings.
- Do not diagnose medical or psychological conditions.
- Keep the reflection supportive and non-clinical.

Journal entry:
{content}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "Return only valid JSON for journal analysis.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
    )

    result = response.choices[0].message.content
    if not result:
        raise ValueError("AI returned an empty response")

    parsed = json.loads(result)
    parsed["sentiment_score"] = max(
        -1.0, min(1.0, float(parsed["sentiment_score"]))
    )
    parsed["confidence"] = max(
        0.0, min(1.0, float(parsed["confidence"]))
    )
    parsed["themes"] = [str(x) for x in parsed.get("themes", [])[:5]]
    return parsed
