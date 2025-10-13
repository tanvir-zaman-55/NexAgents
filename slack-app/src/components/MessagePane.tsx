import { useEffect, useRef } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import Message from "./Message";
import MessageInput from "./MessageInput";
import "./MessagePane.css";

interface MessagePaneProps {
  channelId: Id<"channels">;
  userId: Id<"users">;
  searchQuery: string;
}

function MessagePane({ channelId, userId, searchQuery }: MessagePaneProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messages = useQuery(api.messages.list, { channelId });
  const searchResults = useQuery(
    api.messages.search,
    searchQuery.trim() ? { query: searchQuery.trim() } : "skip"
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const displayMessages = searchQuery.trim() ? searchResults : messages;

  return (
    <div className="message-pane">
      <div className="messages-container">
        {displayMessages?.length === 0 ? (
          <div className="empty-state">
            {searchQuery.trim()
              ? "No messages found matching your search"
              : "No messages yet. Start the conversation!"}
          </div>
        ) : (
          displayMessages?.map((message) => (
            <Message
              key={message._id}
              userName={message.user.name}
              avatarUrl={message.user.avatarUrl}
              text={message.text}
              timestamp={message.createdAt}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      {!searchQuery.trim() && <MessageInput channelId={channelId} userId={userId} />}
    </div>
  );
}

export default MessagePane;
