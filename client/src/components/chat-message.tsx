import { Bot, User } from "lucide-react";
import type { ChatMessage } from "@shared/schema";

interface ChatMessageProps {
  message: ChatMessage;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.sender === 'ai';

  if (isAI) {
    return (
      <div className="chat-bubble flex items-start space-x-3" data-testid="chat-message-ai">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-muted p-3 rounded-lg rounded-tl-none max-w-xs">
          <p className="text-sm" data-testid="message-text">{message.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-bubble flex items-start space-x-3 justify-end" data-testid="chat-message-user">
      <div className="bg-primary text-primary-foreground p-3 rounded-lg rounded-tr-none max-w-xs">
        <p className="text-sm" data-testid="message-text">{message.message}</p>
      </div>
      <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
        <User className="w-4 h-4 text-white" />
      </div>
    </div>
  );
}
