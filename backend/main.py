from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import httpx
import json
import uuid
import os
from .database import get_db_connection
from .ipc import search_ipc
from .seed import seed_database

app = FastAPI(title="LegalEase Backend")
print("Starting FastAPI Backend...")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SessionCreate(BaseModel):
    title: str = "New Chat"

class ChatMessage(BaseModel):
    sessionId: str
    message: str
    language: str = "English"

@app.get("/api/seed")
def api_seed(force: bool = False):
    return seed_database(force=force)

@app.get("/api/sessions")
def get_sessions():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, title, created_at, updated_at FROM sessions ORDER BY updated_at DESC")
    sessions = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return sessions

@app.post("/api/sessions")
def create_session(data: SessionCreate):
    conn = get_db_connection()
    cursor = conn.cursor()
    session_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO sessions (id, title) VALUES (?, ?)", (session_id, data.title))
    conn.commit()
    conn.close()
    return {"id": session_id, "title": data.title}

@app.get("/api/sessions/{session_id}/messages")
def get_session_messages(session_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT role, content, sources FROM messages WHERE session_id = ? ORDER BY created_at ASC", (session_id,))
    messages = []
    for r in cursor.fetchall():
        d = dict(r)
        d['sources'] = json.loads(d['sources']) if d['sources'] else []
        messages.append(d)
    conn.close()
    return messages

@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM messages WHERE session_id = ?", (session_id,))
    cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
    conn.commit()
    conn.close()
    return {"success": True}

@app.post("/api/chat")
async def chat_endpoint(data: ChatMessage):
    session_id = data.sessionId
    message = data.message
    language = data.language
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Save user message
    user_msg_id = str(uuid.uuid4())
    cursor.execute("INSERT INTO messages (id, session_id, role, content, sources) VALUES (?, ?, 'user', ?, '[]')", (user_msg_id, session_id, message))
    
    # Update session title
    cursor.execute("SELECT title FROM sessions WHERE id = ?", (session_id,))
    row = cursor.fetchone()
    if row and row['title'] == 'New Chat':
        new_title = message[:37] + '...' if len(message) > 40 else message
        cursor.execute("UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", (new_title, session_id))
    else:
        cursor.execute("UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?", (session_id,))
    
    conn.commit()
    
    # Search IPC
    sources = search_ipc(message)
    sources_json = json.dumps(sources)
    
    context_str = ""
    for src in sources:
        # Truncate long descriptions to keep context small and speed up inference
        desc = src['description']
        if len(desc) > 500:
            desc = desc[:500] + "..."
        context_str += f"Section {src['section']}: {src['offense']} | Punishment: {src['punishment']}\n{desc}\n---\n"
        
    system_prompt = f"""You are a friendly Indian law (IPC) assistant. You MUST respond entirely in {language}.

IPC SECTIONS:
{context_str}

RULES:
- Respond ONLY in {language}. Every word of your response must be in {language}.
- Explain legal terms in simple, plain language that a 15-year-old can understand.
- After stating the law, give a short real-life example to illustrate it.
- Avoid legal jargon. If you must use a legal term, immediately explain it in brackets.
- Structure: 1) What the law says (simplified) 2) Punishment 3) Simple example 4) Disclaimer.
- If no relevant section found, say so in {language}.
- End with a disclaimer to consult a lawyer, in {language}.
- Do not answer non-law questions."""

    # Only keep last 6 messages for context to avoid bloating the prompt
    cursor.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 6", (session_id,))
    history = [{"role": r['role'], "content": r['content']} for r in cursor.fetchall()]
    history.reverse()
    conn.close()
    
    messages_payload = [{"role": "system", "content": system_prompt}] + history
    
    model = os.environ.get("OLLAMA_MODEL", "deepseek-r1:latest")
    
    # Ollama performance options
    ollama_options = {
        "num_ctx": 2048,       # Smaller context window = faster processing
        "num_predict": 512,    # Max tokens to generate
        "temperature": 0.3,    # Lower = faster, more deterministic
    }
    
    async def response_generator():
        full_response = []
        base_url = os.environ.get("OLLAMA_BASE_URL", "http://localhost:11434")
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", f"{base_url}/api/chat", json={"model": model, "messages": messages_payload, "stream": True, "options": ollama_options}, timeout=None) as response:
                    response.raise_for_status()
                    async for chunk in response.aiter_lines():
                        if not chunk: continue
                        try:
                            data = json.loads(chunk)
                            if "message" in data and "content" in data["message"]:
                                text = data["message"]["content"]
                                full_response.append(text)
                                yield f"data: {json.dumps({'text': text})}\n\n".encode('utf-8')
                        except json.JSONDecodeError:
                            pass
        except Exception as e:
            err_msg = f"\n\n[Error communicating with local Ollama: {str(e)}. Please ensure Ollama is running.]"
            full_response.append(err_msg)
            yield f"data: {json.dumps({'text': err_msg})}\n\n".encode('utf-8')
            
        # Save to DB
        ast_msg_id = str(uuid.uuid4())
        final_content = "".join(full_response)
        conn = get_db_connection()
        conn.execute("INSERT INTO messages (id, session_id, role, content, sources) VALUES (?, ?, 'assistant', ?, ?)", 
                     (ast_msg_id, session_id, final_content, sources_json))
        conn.commit()
        conn.close()
        
        yield f"data: {json.dumps({'sources': sources})}\n\n".encode('utf-8')
        yield b"data: [DONE]\n\n"

    return StreamingResponse(response_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
    })
