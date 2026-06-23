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

app = FastAPI(title="URIM-AI Backend")
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
        
    lang_instruction = ""
    if language != "English":
        lang_instruction = f"""
CRITICAL LANGUAGE INSTRUCTION:
You MUST write your ENTIRE response in {language} script/language.
Do NOT use English at all. Not even for section numbers — write them as numerals only.
If the user writes in English, you still reply in {language}.
Start your response with a greeting in {language}."""

    system_prompt = f"""You are MEI (Multilingual Engine for Information). You are an AI created for URIM-AI. 
Your purpose is to act as a friendly, accessible Indian law assistant. You help people understand their rights and the Indian Penal Code (IPC) without confusing legal jargon.
If a user asks who you are or what your purpose is, kindly introduce yourself as MEI and explain your role in {language}.
{lang_instruction}

IPC SECTIONS:
{context_str}

RULES:
- Respond ONLY in {language}. Every single sentence must be in {language}.
- Explain legal terms in simple, plain language that a 15-year-old can understand.
- After stating the law, give a short real-life example to illustrate it.
- Avoid legal jargon. If you must use a legal term, immediately explain it in brackets.
- Structure: 1) What the law says (simplified) 2) Punishment 3) Simple example 4) Disclaimer.
- If no relevant section found, say so in {language}.
- End with a disclaimer to consult a lawyer, in {language}.
- Do not answer non-law questions.
- REMEMBER: Your response language is {language}. Not English."""

    # Only keep last 6 messages for context to avoid bloating the prompt
    cursor.execute("SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 6", (session_id,))
    history = [{"role": r['role'], "content": r['content']} for r in cursor.fetchall()]
    history.reverse()
    conn.close()
    
    messages_payload = [{"role": "system", "content": system_prompt}] + history
    
    model = os.environ.get("OLLAMA_MODEL", "gemma3:4b")
    
    # Ollama performance options — gemma3:4b handles larger context well
    ollama_options = {
        "num_ctx": 4096,
        "num_predict": 768,
        "temperature": 0.4,
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

@app.get("/api/search")
def search_laws(q: str = "", limit: int = 20, offset: int = 0):
    """Search IPC sections by keyword, section number, or offense."""
    conn = get_db_connection()
    cursor = conn.cursor()
    
    if not q.strip():
        conn.close()
        return {"results": [], "total": 0, "query": q}
    
    # Use the existing search logic
    from .ipc import search_ipc
    results = search_ipc(q, limit=limit)
    
    # If no exact results, try fuzzy search (split query into words and LIKE each)
    if not results:
        words = [w for w in q.strip().split() if len(w) > 1]
        if words:
            conditions = " AND ".join([
                "(offense LIKE ? OR description LIKE ? OR punishment LIKE ?)" for _ in words
            ])
            params = []
            for w in words:
                like = f"%{w}%"
                params.extend([like, like, like])
            params.append(limit)
            cursor.execute(f"""
                SELECT section, offense, punishment, description
                FROM ipc_sections
                WHERE {conditions}
                LIMIT ?
            """, params)
            results = [dict(r) for r in cursor.fetchall()]
    
    # Filter out results where key fields are 'nan' or empty
    clean_results = []
    for r in results:
        section = r.get('section', '') or ''
        offense = r.get('offense', '') or ''
        punishment = r.get('punishment', '') or ''
        description = r.get('description', '') or ''
        
        # Skip rows where critical fields are nan or empty
        if section.lower() == 'nan' or offense.lower() == 'nan':
            continue
        if not section.strip() or not offense.strip():
            continue
        
        # Clean nan from individual fields
        r['offense'] = '' if offense.lower() == 'nan' else offense
        r['punishment'] = 'Not specified' if punishment.lower() == 'nan' or not punishment.strip() else punishment
        r['description'] = '' if description.lower() == 'nan' else description
        
        clean_results.append(r)
    
    conn.close()
    return {"results": clean_results, "total": len(clean_results), "query": q}

@app.get("/api/topics")
def get_topics():
    """Get distinct offense categories for browsing."""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT offense, COUNT(*) as count, MIN(section) as example_section
        FROM ipc_sections
        WHERE offense IS NOT NULL AND offense != '' AND LOWER(offense) != 'nan'
        GROUP BY offense
        ORDER BY count DESC
        LIMIT 50
    """)
    topics = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return topics

LEGAL_TERMS = [
    {"term": "FIR", "full_form": "First Information Report", "category": "Procedure", "definition": "A written document prepared by the police when they receive information about the commission of a cognizable offence. It is the first step in criminal proceedings and can be filed by the victim, a witness, or anyone who knows about the crime.", "example": "If someone's house is robbed, they go to the nearest police station and file an FIR describing what happened, what was stolen, and any suspects they know of.", "related": ["Cognizable Offence", "Complaint", "Police Report"]},
    {"term": "Bail", "full_form": "", "category": "Procedure", "definition": "The temporary release of an accused person awaiting trial, sometimes on condition that a sum of money is deposited to guarantee their appearance in court. Bail can be granted by the police (station bail) or by a court.", "example": "A person arrested for a minor offence like petty theft can apply for bail so they don't have to stay in jail while waiting for their trial date.", "related": ["Anticipatory Bail", "Surety", "Bond"]},
    {"term": "Anticipatory Bail", "full_form": "", "category": "Procedure", "definition": "A provision under Section 438 of CrPC that allows a person to seek bail in anticipation of an arrest. It is granted by the Sessions Court or High Court when a person has reason to believe they may be arrested for a non-bailable offence.", "example": "If a businessman fears he might be falsely accused in a fraud case, he can apply for anticipatory bail before the police come to arrest him.", "related": ["Bail", "CrPC", "Non-Bailable Offence"]},
    {"term": "Affidavit", "full_form": "", "category": "Document", "definition": "A written statement of facts confirmed by the oath of the person making it (the deponent), before a notary public or other authorized officer. It is used as evidence in court proceedings.", "example": "When applying for a passport, you may need to submit an affidavit stating your date of birth and address, sworn before a notary.", "related": ["Oath", "Deponent", "Notary"]},
    {"term": "Injunction", "full_form": "", "category": "Remedy", "definition": "A court order that requires a party to do or refrain from doing a specific act. A temporary injunction maintains the status quo until the case is decided; a permanent injunction is part of the final judgement.", "example": "If your neighbour starts illegally constructing a wall on your property, you can get a court injunction ordering them to stop construction immediately.", "related": ["Stay Order", "Restraining Order", "Interim Order"]},
    {"term": "Cognizable Offence", "full_form": "", "category": "Criminal Law", "definition": "An offence in which the police can arrest without a warrant and start an investigation without the permission of a court. These are generally serious crimes like murder, robbery, and kidnapping.", "example": "Murder is a cognizable offence — the police can immediately arrest the suspect and begin investigation without needing a magistrate's order.", "related": ["Non-Cognizable Offence", "FIR", "Warrant"]},
    {"term": "Non-Cognizable Offence", "full_form": "", "category": "Criminal Law", "definition": "An offence in which the police cannot arrest without a warrant and cannot investigate without the permission of a magistrate. These are generally less serious crimes.", "example": "Cheating or forgery of a minor nature is a non-cognizable offence. The police will ask you to approach a magistrate first before they can investigate.", "related": ["Cognizable Offence", "NCR", "Magistrate"]},
    {"term": "Habeas Corpus", "full_form": "", "category": "Constitutional", "definition": "A Latin term meaning 'produce the body.' It is a writ (court order) that requires a person who is detaining someone to bring the detained person before the court and justify the detention.", "example": "If police arrest someone and hold them without charges for too long, their family can file a habeas corpus petition asking the court to order the police to produce the person.", "related": ["Writ", "Fundamental Rights", "Illegal Detention"]},
    {"term": "Writ", "full_form": "", "category": "Constitutional", "definition": "A formal written order issued by a court directing a person or authority to do or not do something. The Indian Constitution provides for five types of writs: Habeas Corpus, Mandamus, Prohibition, Certiorari, and Quo Warranto.", "example": "If a government office refuses to issue your ration card without valid reason, you can file a writ of mandamus asking the court to direct them to issue it.", "related": ["Habeas Corpus", "Mandamus", "High Court"]},
    {"term": "Summons", "full_form": "", "category": "Procedure", "definition": "A legal document issued by a court ordering a person to appear before the court on a specific date and time. Ignoring a summons can lead to a warrant being issued.", "example": "If you are called as a witness in a case, the court will send you a summons with the date you must appear to give your testimony.", "related": ["Warrant", "Subpoena", "Court Order"]},
    {"term": "Warrant", "full_form": "", "category": "Procedure", "definition": "A written order issued by a judge or magistrate authorizing the police to make an arrest, conduct a search, or carry out some other action related to the administration of justice.", "example": "The police need a search warrant from a magistrate before they can legally enter and search someone's house for evidence.", "related": ["Arrest Warrant", "Search Warrant", "Summons"]},
    {"term": "Plea Bargaining", "full_form": "", "category": "Procedure", "definition": "A process where the accused negotiates with the prosecution for a lesser punishment by agreeing to plead guilty. Introduced in India through Chapter XXIA of CrPC for offences with punishment up to 7 years.", "example": "A person accused of a minor theft (punishable by 3 years) may opt for plea bargaining, plead guilty, and receive a reduced sentence of community service instead of jail time.", "related": ["Guilty Plea", "Sentence", "CrPC"]},
    {"term": "Chargesheet", "full_form": "", "category": "Procedure", "definition": "A formal document prepared by the police after investigation, filed before a magistrate under Section 173 of CrPC. It contains the facts of the case, evidence collected, and names of the accused.", "example": "After investigating a robbery for 60 days, the police file a chargesheet in court listing the evidence they found and the persons they believe committed the crime.", "related": ["FIR", "Investigation", "Prosecution"]},
    {"term": "Defamation", "full_form": "", "category": "Criminal Law", "definition": "The act of making false statements about a person that harm their reputation. Under IPC Section 499, defamation can be both a civil wrong (for which you can claim damages) and a criminal offence (punishable with imprisonment up to 2 years).", "example": "If someone publicly posts false accusations on social media claiming you are a thief, knowing it to be untrue, that constitutes defamation.", "related": ["Libel", "Slander", "Section 499"]},
    {"term": "Dowry", "full_form": "", "category": "Family Law", "definition": "Any property, goods, or money given or agreed to be given by the bride's family to the groom or his family as a condition of marriage. The Dowry Prohibition Act, 1961 makes giving and taking dowry a punishable offence with imprisonment up to 5 years and fine.", "example": "If the groom's family demands a car and cash as a condition for marriage, that constitutes dowry, and both demanding and giving it is illegal.", "related": ["Section 498A", "Dowry Death", "Cruelty"]},
    {"term": "Acquittal", "full_form": "", "category": "Judgement", "definition": "A judgement that a person accused of a crime is not guilty. The accused is set free and cannot be tried again for the same offence (protection against double jeopardy).", "example": "After hearing all evidence, if the judge finds that the prosecution failed to prove the accused committed murder, the accused receives an acquittal and walks free.", "related": ["Conviction", "Verdict", "Double Jeopardy"]},
    {"term": "Conviction", "full_form": "", "category": "Judgement", "definition": "A formal declaration by a court that someone is guilty of a criminal offence. After conviction, the judge pronounces the sentence (punishment).", "example": "If the court finds that the evidence proves beyond reasonable doubt that a person committed theft, they receive a conviction and are sentenced to imprisonment.", "related": ["Acquittal", "Sentence", "Guilty"]},
    {"term": "Contempt of Court", "full_form": "", "category": "Constitutional", "definition": "Any act that disrespects or defies the authority, justice, or dignity of the court. It can be civil (disobeying a court order) or criminal (scandalizing the court). Punishable with imprisonment up to 6 months or fine up to ₹2,000.", "example": "If a person is ordered by the court to pay maintenance to their spouse but deliberately refuses to do so, they can be held in contempt of court.", "related": ["Court Order", "Judiciary", "Punishment"]},
    {"term": "Stay Order", "full_form": "", "category": "Remedy", "definition": "A temporary court order that halts judicial proceedings or the enforcement of a judgement until a further order is made. It maintains the status quo.", "example": "If a demolition order is passed for a building, the owner can seek a stay order from a higher court to stop the demolition until their appeal is heard.", "related": ["Injunction", "Interim Order", "Appeal"]},
    {"term": "Power of Attorney", "full_form": "POA", "category": "Document", "definition": "A legal document that gives one person (the agent) the authority to act on behalf of another person (the principal) in legal, financial, or property matters.", "example": "If you live abroad and need to sell your property in India, you can give your brother a Power of Attorney to sign the sale deed on your behalf.", "related": ["Agent", "Principal", "Registration"]},
    {"term": "Suo Motu", "full_form": "", "category": "Constitutional", "definition": "A Latin term meaning 'on its own motion.' When a court takes action on its own without any party filing a case, based on information from news reports, letters, or public interest concerns.", "example": "After seeing news reports about child labour in a factory, the High Court may take suo motu cognizance and order an investigation without anyone filing a petition.", "related": ["PIL", "Judicial Activism", "High Court"]},
    {"term": "PIL", "full_form": "Public Interest Litigation", "category": "Constitutional", "definition": "A legal action initiated in a court of law for the enforcement of public interest or general interest. Any citizen can file a PIL on behalf of the public even if they are not directly affected.", "example": "A social activist files a PIL in the Supreme Court asking the government to improve the condition of public hospitals for the benefit of all citizens.", "related": ["Suo Motu", "Fundamental Rights", "Writ"]},
    {"term": "Surety", "full_form": "", "category": "Procedure", "definition": "A person who takes responsibility for the accused's bail bond. If the accused fails to appear in court, the surety must pay the bail amount.", "example": "When your friend gets bail, you can stand as their surety — meaning if they don't show up in court, you will have to pay the bail money.", "related": ["Bail", "Bond", "Guarantor"]},
    {"term": "Bailable Offence", "full_form": "", "category": "Criminal Law", "definition": "An offence where bail is a matter of right. The accused can demand bail and the police or court must grant it. These are generally less serious offences listed in the First Schedule of CrPC.", "example": "Minor hurt (Section 323 IPC) is a bailable offence. If arrested, you can get bail at the police station itself as a matter of right.", "related": ["Non-Bailable Offence", "Bail", "CrPC"]},
    {"term": "Non-Bailable Offence", "full_form": "", "category": "Criminal Law", "definition": "An offence where bail is not a matter of right and can only be granted by the court at its discretion. These are generally serious offences like murder, dacoity, and kidnapping.", "example": "Murder is a non-bailable offence. The accused cannot demand bail as a right and must convince the court to grant it.", "related": ["Bailable Offence", "Bail", "Anticipatory Bail"]},
    {"term": "Quash", "full_form": "", "category": "Remedy", "definition": "To declare a legal proceeding, order, or FIR as null and void. A High Court can quash an FIR or criminal proceedings under Section 482 CrPC if it finds them to be frivolous or an abuse of the legal process.", "example": "If a false FIR is filed against someone out of personal revenge, the accused can approach the High Court to quash the FIR.", "related": ["Section 482", "High Court", "FIR"]},
    {"term": "Adjournment", "full_form": "", "category": "Procedure", "definition": "The postponement of a court hearing to another date. Courts may grant adjournments for valid reasons, but excessive adjournments are a major cause of case delays in India.", "example": "If your lawyer is unwell on the court date, the case hearing can be adjourned (postponed) to the next available date.", "related": ["Hearing", "Court Proceedings", "Delay"]},
    {"term": "Caveat", "full_form": "", "category": "Procedure", "definition": "A legal notice filed by a party (caveator) requesting the court not to pass any order in a case without giving them a hearing first. Valid for 90 days under Section 148A of CPC.", "example": "If you know your business rival might file a case against you, you file a caveat so the court must hear your side before passing any interim order.", "related": ["CPC", "Court Order", "Notice"]},
    {"term": "Decree", "full_form": "", "category": "Judgement", "definition": "The formal expression of an adjudication in a civil case that determines the rights of the parties. A decree is the final order in a civil suit and is enforceable.", "example": "After a property dispute trial, the court passes a decree declaring that the land belongs to Party A and ordering Party B to vacate within 30 days.", "related": ["Judgement", "Order", "Execution"]},
    {"term": "Affidavit", "full_form": "", "category": "Document", "definition": "A written statement of facts confirmed by the oath of the person making it (the deponent), before a notary public or other authorized officer. It is used as evidence in court proceedings.", "example": "When applying for a passport, you may need to submit an affidavit stating your date of birth and address, sworn before a notary.", "related": ["Oath", "Deponent", "Notary"]},
    {"term": "Remand", "full_form": "", "category": "Procedure", "definition": "A court order sending the accused back to custody (police or judicial) for further investigation or until the next hearing. Police remand allows police to question the accused; judicial remand sends them to jail.", "example": "After arresting a fraud suspect, the police produce them before a magistrate within 24 hours and request 5 days of police remand for further questioning.", "related": ["Custody", "Magistrate", "Investigation"]},
]

@app.get("/api/dictionary")
def get_dictionary(q: str = "", category: str = ""):
    """Search legal terms dictionary."""
    results = LEGAL_TERMS
    
    if not q.strip() and not category:
        return {"results": [], "total": 0}
    
    if category:
        results = [t for t in results if t["category"].lower() == category.lower()]
    
    if q.strip():
        import difflib
        q_lower = q.strip().lower()
        
        def get_match_score(t):
            term_lower = t["term"].lower()
            full_form_lower = t.get("full_form", "").lower()
            definition_lower = t["definition"].lower()
            
            # Exact match gives highest score
            if q_lower == term_lower: return 100
            if q_lower == full_form_lower: return 95
            
            # Substring match gives high score
            if q_lower in term_lower: return 90
            if q_lower in full_form_lower: return 85
            
            # Fuzzy match on term
            ratio = difflib.SequenceMatcher(None, q_lower, term_lower).ratio()
            if ratio > 0.65: return 70 + (ratio * 10)
            
            # Substring match in definition
            if q_lower in definition_lower: return 60
            
            # Word level match in definition
            words_in_def = sum(1 for w in q_lower.split() if w in definition_lower)
            if words_in_def > 0 and words_in_def == len(q_lower.split()):
                return 50
                
            return 0

        scored_results = [(t, get_match_score(t)) for t in results]
        # Filter out zero scores and sort by highest score
        filtered_sorted = sorted([item for item in scored_results if item[1] > 0], key=lambda x: x[1], reverse=True)
        results = [item[0] for item in filtered_sorted]
    
    return {"results": results, "total": len(results)}

@app.get("/api/dictionary/categories")
def get_dictionary_categories():
    """Get distinct categories in the dictionary."""
    cats = {}
    for t in LEGAL_TERMS:
        c = t["category"]
        cats[c] = cats.get(c, 0) + 1
    return [{"category": k, "count": v} for k, v in sorted(cats.items())]



