import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import "./EditProfile.css";

interface EditProfileProps {
  userId: Id<"users">;
}

function EditProfile({ userId }: EditProfileProps) {
  const user = useQuery(api.users.get, { userId });
  const [name, setName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateName = useMutation(api.users.updateName);
  const updateAvatar = useMutation(api.users.updateAvatar);
  const generateUploadUrl = useMutation(api.users.generateUploadUrl);

  // Initialize name when user data loads
  useState(() => {
    if (user && !name) {
      setName(user.name);
    }
  });

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateName({ userId, name: name.trim() });
    alert("Name updated!");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    try {
      setUploading(true);

      // Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!result.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await result.json();

      // Update user avatar
      await updateAvatar({ userId, storageId });
      alert("Avatar updated!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name.slice(0, 2);
  };

  if (!user) {
    return <div className="edit-profile">Loading...</div>;
  }

  return (
    <div className="edit-profile">
      <div className="profile-container">
        <h2>Edit Profile</h2>

        <div className="profile-section">
          <h3>Profile Photo</h3>
          <div className="avatar-section">
            <div className="current-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <div className="avatar-placeholder-large">
                  {getInitials(user.name).toUpperCase()}
                </div>
              )}
            </div>
            <div className="avatar-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="file-input"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload" className="upload-button">
                {uploading ? "Uploading..." : "Choose Photo"}
              </label>
              <p className="upload-hint">JPG, PNG or GIF (max 5MB)</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Display Name</h3>
          <form onSubmit={handleNameSubmit} className="name-form">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="name-input"
            />
            <button type="submit" className="save-button">
              Save Name
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProfile;
