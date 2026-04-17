def analyze_lead(lead):
    score = 0
    reasons = []

    signal = lead["signal"].lower()
    role = lead["role"].lower()

    if "funding" in signal:
        score += 15
        reasons.append("Recently funded")

    if "hiring" in signal:
        score += 10
        reasons.append("Hiring team")

    if "scaling" in signal:
        score += 8
        reasons.append("Scaling fast")

    if role in ["cto", "ceo", "founder"]:
        score += 10
        reasons.append("Decision maker")

    return score, " | ".join(reasons)