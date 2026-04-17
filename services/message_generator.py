import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def generate_message(lead, reason):
    prompt = f"""
        You are a high-performing SDR writing personalized cold outreach.
        
        Lead details:
        - Name: {lead['name']}
        - Role: {lead['role']}
        - Company: {lead['company']}
        - Signal: {lead['signal']}
        
        Insight:
        {reason}
        
        Task:
        Write a short, highly personalized outbound message.
        
        Rules:
        - Max 60 words
        - Mention the signal naturally
        - Connect it to a real business pain
        - Subtly introduce an AI SaaS solution
        - Sound human, not salesy
        - DO NOT use generic phrases like "hope you're doing well"
        - DO NOT give multiple options
        - DO NOT explain anything
        
        Output format:
        Message: <your message>
        Why: <1 line explaining why this message works>
        """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )

        text = response.text.strip()

        # Optional: basic parsing
        if "Why:" in text:
            parts = text.split("Why:")
            message = parts[0].replace("Message:", "").strip()
            why = parts[1].strip()
        else:
            message = text
            why = "No explanation provided"

        return {
            "message": message,
            "why": why
        }

    except Exception as e:
        print("GEMINI ERROR:", e)
        return {
            "message": "Error generating message",
            "why": str(e)
        }


# if __name__ == "__main__":
#     test_lead = {
#         "name": "Rahul",
#         "role": "CTO",
#         "company": "FintechX",
#         "signal": "Hiring engineers"
#     }
#
#     reason = "Company is scaling team → likely needs automation tools"
#
#     result = generate_message(test_lead, reason)
#     print(result)