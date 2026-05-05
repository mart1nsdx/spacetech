import os
import tempfile

from dotenv import load_dotenv
load_dotenv()

import chromadb
import speech_recognition as sr
from groq import Groq
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

app = FastAPI(title="AeroBot API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

groq = Groq()
recognizer = sr.Recognizer()

db = chromadb.PersistentClient(path="./knowledge_base/chroma_db")
try:
    collection = db.get_collection("aerobot")
except Exception:
    collection = None

SYSTEM_PROMPTS = {
    "es": """Eres AeroBot, un asistente educativo estilo Jarvis especializado en ingeniería aeroespacial.
Tienes conocimiento profundo en: mecánica orbital, propulsión, aerodinámica, estructuras aeroespaciales,
aviónica, cohetes, satélites, exploración espacial, y más.

Tu misión es ayudar a nuevos miembros del grupo a aprender desde cero.
- Usa tu conocimiento aeroespacial completo para responder con precisión
- Explica conceptos de forma clara, sin asumir conocimiento previo
- Usa analogías simples para conceptos complejos
- Si el usuario tiene materiales del grupo como contexto adicional, úsalos
- Sé conciso, directo y motivador
- Responde siempre en español""",

    "en": """You are AeroBot, a Jarvis-style educational assistant specialized in aerospace engineering.
You have deep knowledge in: orbital mechanics, propulsion, aerodynamics, aerospace structures,
avionics, rockets, satellites, space exploration, and more.

Your mission is to help new group members learn from scratch.
- Use your full aerospace knowledge to answer accurately
- Explain concepts clearly, without assuming prior knowledge
- Use simple analogies for complex concepts
- If the user has group-specific materials as additional context, use them
- Be concise, direct and encouraging
- Always respond in English""",
}


class TextRequest(BaseModel):
    question: str
    language: str = "es"


def query_knowledge_base(question: str) -> str:
    if collection is None:
        return ""
    results = collection.query(query_texts=[question], n_results=3)
    return "\n\n".join(results["documents"][0])


def detect_language(text: str) -> str:
    spanish_words = {"qué", "cómo", "por", "para", "que", "es", "una", "un", "en", "de", "la", "el"}
    words = set(text.lower().split())
    return "es" if words & spanish_words else "en"


def get_answer(question: str, language: str) -> str:
    context = query_knowledge_base(question)
    content = f"Reference context:\n{context}\n\nQuestion: {question}" if context else question

    response = groq.chat.completions.create(
        model="llama-3.3-70b-versatile",
        max_tokens=1024,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPTS[language]},
            {"role": "user", "content": content},
        ],
    )
    return response.choices[0].message.content


@app.get("/")
def index():
    return FileResponse("index.html")


@app.get("/health")
def health():
    kb_status = "ready" if collection else "not indexed — run ingest.py first"
    return {"status": "AeroBot online 🚀", "knowledge_base": kb_status}


@app.post("/ask/text")
def ask_text(request: TextRequest):
    language = request.language if request.language in ("es", "en") else detect_language(request.question)
    answer = get_answer(request.question, language)
    return {"answer": answer, "language": language}


@app.post("/ask/voice")
async def ask_voice(audio: UploadFile = File(...)):
    if not audio.filename.endswith((".wav", ".flac", ".aiff")):
        raise HTTPException(status_code=400, detail="Format must be .wav, .flac or .aiff")

    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
        tmp.write(await audio.read())
        tmp_path = tmp.name

    try:
        with sr.AudioFile(tmp_path) as source:
            audio_data = recognizer.record(source)

        # Try Spanish first, fallback to English
        try:
            transcript = recognizer.recognize_google(audio_data, language="es-ES")
            language = "es"
        except sr.UnknownValueError:
            transcript = recognizer.recognize_google(audio_data, language="en-US")
            language = "en"

        answer = get_answer(transcript, language)
        return {"transcript": transcript, "answer": answer, "language": language}

    except sr.UnknownValueError:
        raise HTTPException(status_code=422, detail="Could not understand the audio")
    except sr.RequestError as e:
        raise HTTPException(status_code=503, detail=f"Speech recognition error: {e}")
    finally:
        os.unlink(tmp_path)
