import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./MessageInput.css";

interface MessageInputProps {
  channelId: Id<"channels">;
  userId: Id<"users">;
}

function MessageInput({ channelId, userId }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const sendMessage = useMutation(api.messages.send);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    await sendMessage({
      channelId,
      userId,
      text: message.trim(),
    });
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-container">
      <form onSubmit={handleSubmit} className="message-input-form">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="message-input"
        />
        <button type="submit" className="send-button" disabled={!message.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default MessageInput;
