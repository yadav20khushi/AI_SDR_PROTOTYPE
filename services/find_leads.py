import json

def find_leads():
    with open("data/leads.json") as f:
        return json.load(f)