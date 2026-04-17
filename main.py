from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.find_leads import find_leads
from services.signal_analyzer import analyze_lead
from services.message_generator import generate_message

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "AI SDR system running"}


@app.get("/run-outbound")
def run_outbound():

    leads = find_leads()
    results = []

    for lead in leads:
        score, reason = analyze_lead(lead)
        message_data = generate_message(lead, reason)

        results.append({
            "name": lead["name"],
            "company": lead["company"],
            "score": score,
            "reason": reason,
            "message": message_data["message"],
            "why": message_data["why"]
        })

    results = sorted(results, key=lambda x: x["score"], reverse=True)

    return {"results": results}