import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import ChannelsPanel from "./components/ChannelsPanel";
import MessagePane from "./components/MessagePane";
import SearchBar from "./components/SearchBar";
import EditProfile from "./components/EditProfile";
import "./App.css";

function App() {
  const [currentUserId, setCurrentUserId] = useState<Id<"users"> | null>(null);
  const [currentChannelId, setCurrentChannelId] = useState<Id<"channels"> | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const createUser = useMutation(api.users.create);
  const channels = useQuery(api.channels.list);

  // Initialize user on first load
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setCurrentUserId(storedUserId as Id<"users">);
    } else {
      // Create a new user
      createUser({ name: "User" }).then((userId) => {
        setCurrentUserId(userId);
        localStorage.setItem("userId", userId);
      });
    }
  }, [createUser]);

  // Select first channel by default
  useEffect(() => {
    if (channels && channels.length > 0 && !currentChannelId) {
      setCurrentChannelId(channels[0]._id);
    }
  }, [channels, currentChannelId]);

  if (!currentUserId) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Slack Clone</h1>
        <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <button className="profile-button" onClick={() => setShowProfile(!showProfile)}>
          {showProfile ? "Back to Chat" : "Edit Profile"}
        </button>
      </header>

      {showProfile ? (
        <EditProfile userId={currentUserId} />
      ) : (
        <div className="main-content">
          <ChannelsPanel
            currentChannelId={currentChannelId}
            onChannelSelect={setCurrentChannelId}
          />
          {currentChannelId && (
            <MessagePane
              channelId={currentChannelId}
              userId={currentUserId}
              searchQuery={searchQuery}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default App;
