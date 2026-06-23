export async function streamOllamaChat(
  model: string,
  messages: { role: string; content: string }[],
  onChunk: (chunk: string) => void
): Promise<void> {
  const baseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
  
  const res = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, stream: true }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errText}`);
  }

  if (!res.body) {
    throw new Error('No response body from Ollama');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const lines = decoder.decode(value).split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        const parsed = JSON.parse(line);
        if (parsed.message?.content) {
          onChunk(parsed.message.content);
        }
      } catch (e) {
        // partial line or parsing error, ignored
      }
    }
  }
}
