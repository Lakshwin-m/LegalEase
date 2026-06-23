import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';

export default function NewChatPage() {
  return (
    <div className="flex w-full h-full">
      <Sidebar />
      <ChatWindow sessionId="" initialMessages={[]} />
    </div>
  );
}
