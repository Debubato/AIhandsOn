from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
import json
from fastapi.middleware.cors import CORSMiddleware

load_dotenv(".env")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI()

class ChatRequest(BaseModel):
    text: str


@app.post("/chat")
def chat(req: ChatRequest):

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
You are an English teacher.

Correct the user's sentence.
Then explain each mistake one by one.

Return JSON only.

{
 "corrected": "correct sentence",
 "mistakes": [
   {
     "original": "...",
     "correction": "...",
     "explanation": "..."
   }
 ]
}
"""
            },
            {
                "role": "user",
                "content": req.text
            }
        ]
    )

    content = response.choices[0].message.content

    data = json.loads(content)

    return {
        "original": req.text,
        "corrected": data["corrected"],
        "mistakes": data["mistakes"]
    }


@app.get("/topic")
def topic():

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role":"system",
                "content":"Generate one interesting conversation question for English learners. Return only the question."
            }
        ]
    )

    return {"topic":response.choices[0].message.content}