import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { searchIPC } from '@/lib/ipc';
import { streamOllamaChat } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, message } = await req.json();

    if (!sessionId || !message) {
      return NextResponse.json({ error: 'Missing sessionId or message' }, { status: 400 });
    }

    // Save user message to DB
    const userMsgId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO messages (id, session_id, role, content, sources)
      VALUES (?, ?, 'user', ?, '[]')
    `).run(userMsgId, sessionId, message);

    // Update session title if it is default
    const session = db.prepare(`SELECT title FROM sessions WHERE id = ?`).get(sessionId) as { title: string } | undefined;
    if (session && session.title === 'New Chat') {
      const newTitle = message.length > 40 ? message.substring(0, 37) + '...' : message;
      db.prepare(`UPDATE sessions SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(newTitle, sessionId);
    } else {
      db.prepare(`UPDATE sessions SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(sessionId);
    }

    // 1. Search IPC
    const sources = searchIPC(message);
    const sourcesJson = JSON.stringify(sources);

    // 2. Format Context
    let contextStr = "RELEVANT IPC SECTIONS:\\n---\\n";
    for (const src of sources) {
      contextStr += `Section ${src.section}: ${src.offense} | Punishment: ${src.punishment}\\n${src.description}\\n---\\n`;
    }

    const systemPrompt = `You are a legal assistant specializing in Indian law (IPC).
Answer only based on the IPC sections provided below.
If the answer is not in the context, say so clearly.
Never fabricate section numbers or punishments.
Always recommend consulting a lawyer for personal legal matters.

${contextStr}

RULES:
- Only answer based on the IPC sections provided above.
- If no relevant section is found, say: "I could not find a relevant IPC section for this query. Please consult a legal professional."
- Never give personal legal advice or predict case outcomes.
- Always end responses with: "This is for informational purposes only. Consult a qualified lawyer for legal advice."
- Do not answer questions unrelated to Indian law.`;

    // 3. Get history
    const history = db.prepare(`
      SELECT role, content FROM messages
      WHERE session_id = ?
      ORDER BY created_at ASC
    `).all(sessionId) as { role: string, content: string }[];

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history
    ];

    // 4. Stream response
    const encoder = new TextEncoder();
    let fullAssistantResponse = '';
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const model = process.env.OLLAMA_MODEL || 'llama3';
          await streamOllamaChat(model, messages, (chunk) => {
            fullAssistantResponse += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
          });
          
          // Stream completed, save to DB
          const astMsgId = crypto.randomUUID();
          db.prepare(`
            INSERT INTO messages (id, session_id, role, content, sources)
            VALUES (?, ?, 'assistant', ?, ?)
          `).run(astMsgId, sessionId, fullAssistantResponse, sourcesJson);

          // Send sources to client in the final chunk
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ sources })}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (error: any) {
          console.error("Ollama streaming error:", error);
          const errMsg = `\n\n[Error communicating with local Ollama: ${error.message}. Please ensure the Ollama app is running in the background.]`;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: errMsg })}\n\n`));
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
