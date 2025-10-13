import "./Message.css";

interface MessageProps {
  userName: string;
  avatarUrl: string | null;
  text: string;
  timestamp: number;
}

function Message({ userName, avatarUrl, text, timestamp }: MessageProps) {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.slice(0, 2);
  };

  return (
    <div className="message">
      <div className="message-avatar">
        {avatarUrl ? (
          <img src={avatarUrl} alt={userName} />
        ) : (
          <div className="avatar-placeholder">{getInitials(userName).toUpperCase()}</div>
        )}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-author">{userName}</span>
          <span className="message-time">{formatTime(timestamp)}</span>
        </div>
        <div className="message-text">{text}</div>
      </div>
    </div>
  );
}

export default Message;
