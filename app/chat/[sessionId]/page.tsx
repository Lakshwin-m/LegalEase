import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';

export default async function ChatPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = await params;
  
  let messages = [];
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/sessions/${sessionId}/messages`, { cache: 'no-store' });
    if (res.ok) {
      messages = await res.json();
    }
  } catch (e) {
    console.error("Failed to fetch messages from FastAPI", e);
  }

  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <ChatWindow sessionId={sessionId} initialMessages={messages} />
    </div>
  );
}
