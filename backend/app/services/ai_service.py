"""
AI Service layer for QuantumShield AI.

Supports both Gemini and Groq via a single interface, selected by
AI_PROVIDER env var. Falls back to a deterministic templated response
if no API key is configured, so the demo NEVER breaks during a hackathon
presentation even without internet access.
"""
from app.config import AI_PROVIDER, GEMINI_API_KEY, GEMINI_MODEL, GROQ_API_KEY, GROQ_MODEL

_gemini_client = None
_groq_client = None


def _get_gemini():
    global _gemini_client
    if _gemini_client is None and GEMINI_API_KEY:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        _gemini_client = genai.GenerativeModel(GEMINI_MODEL)
    return _gemini_client


def _get_groq():
    global _groq_client
    if _groq_client is None and GROQ_API_KEY:
        from groq import Groq
        _groq_client = Groq(api_key=GROQ_API_KEY)
    return _groq_client


def _call_gemini(prompt: str) -> str:
    model = _get_gemini()
    response = model.generate_content(prompt)
    return response.text.strip()


def _call_groq(prompt: str) -> str:
    client = _get_groq()
    completion = client.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": "You are QuantumShield AI, a cybersecurity & fraud analysis assistant for a bank's Security Operations Center. Be concise, technical, and professional."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.4,
        max_tokens=500,
    )
    return completion.choices[0].message.content.strip()


def generate_ai_text(prompt: str, fallback: str) -> str:
    """Try the configured AI provider; gracefully fall back on any error."""
    try:
        if AI_PROVIDER == "gemini" and GEMINI_API_KEY:
            return _call_gemini(prompt)
        if AI_PROVIDER == "groq" and GROQ_API_KEY:
            return _call_groq(prompt)
    except Exception as e:
        print(f"[AI Service] Falling back due to error: {e}")
    return fallback


def build_explanation_prompt(txn, signals):
    signal_text = "; ".join(signals)
    return (
        f"A bank transaction of ₹{txn.amount:,.2f} ({txn.txn_type}) by user '{txn.user}' "
        f"received a risk score of {txn.risk_score}/100 and was categorized as '{txn.threat_category}'. "
        f"The following signals were detected: {signal_text}. "
        f"Write a single, clear paragraph (3-4 sentences) explaining to a bank fraud analyst WHY this "
        f"transaction was flagged, referencing the specific signals. Be precise and professional."
    )


def build_fallback_explanation(txn, signals) -> str:
    if not signals or signals == ["No significant anomalies detected across telemetry and transaction data"]:
        return (
            f"This transaction of ₹{txn.amount:,.2f} received a low risk score of {txn.risk_score}/100. "
            f"No significant anomalies were found in recent login telemetry, device history, or spending "
            f"patterns, so it was cleared automatically by the correlation engine."
        )
    joined = ", ".join(signals[:-1]) + (f", and {signals[-1]}" if len(signals) > 1 else signals[0])
    return (
        f"This transaction received a risk score of {txn.risk_score}/100 because the correlation engine "
        f"detected the following combined signals: {joined}. Together, these patterns are consistent with "
        f"a '{txn.threat_category}' scenario, prompting the system to flag it for review."
    )


def build_chat_prompt(message: str, context: str) -> str:
    return (
        f"You are the QuantumShield AI Security Assistant embedded in a bank's SOC dashboard.\n"
        f"Live context data:\n{context}\n\n"
        f"Analyst question: {message}\n\n"
        f"Answer concisely and professionally using the context data where relevant. "
        f"If the context doesn't contain the answer, respond using general cybersecurity/fraud knowledge."
    )
