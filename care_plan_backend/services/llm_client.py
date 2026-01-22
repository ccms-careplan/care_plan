from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_llm(prompt: str) -> str:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You output ONLY valid JSON."},
            {"role": "user", "content": prompt},
        ],
        temperature=0
    )

    return response.choices[0].message.content.strip()
