import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./ChannelsPanel.css";

interface ChannelsPanelProps {
  currentChannelId: Id<"channels"> | null;
  onChannelSelect: (channelId: Id<"channels">) => void;
}

function ChannelsPanel({ currentChannelId, onChannelSelect }: ChannelsPanelProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");

  const channels = useQuery(api.channels.list);
  const createChannel = useMutation(api.channels.create);

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const channelId = await createChannel({ name: newChannelName.trim() });
    setNewChannelName("");
    setShowCreateForm(false);
    onChannelSelect(channelId);
  };

  return (
    <div className="channels-panel">
      <div className="channels-header">
        <h2>Channels</h2>
        <button
          className="create-channel-button"
          onClick={() => setShowCreateForm(!showCreateForm)}
          title="Create channel"
        >
          +
        </button>
      </div>

      {showCreateForm && (
        <form className="create-channel-form" onSubmit={handleCreateChannel}>
          <input
            type="text"
            placeholder="Channel name"
            value={newChannelName}
            onChange={(e) => setNewChannelName(e.target.value)}
            autoFocus
          />
          <div className="form-buttons">
            <button type="submit">Create</button>
            <button type="button" onClick={() => setShowCreateForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="channels-list">
        {channels?.map((channel) => (
          <div
            key={channel._id}
            className={`channel-item ${
              currentChannelId === channel._id ? "active" : ""
            }`}
            onClick={() => onChannelSelect(channel._id)}
          >
            # {channel.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChannelsPanel;
