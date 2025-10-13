# Slack Clone

A real-time messaging application similar to Slack, built with React, TypeScript, Vite, and Convex.

## Features

- **Channel Management**: Create and switch between different channels
- **Real-time Messaging**: Send and receive messages instantly
- **User Profiles**: Upload profile photos and change your display name
- **Message Search**: Search across all messages in real-time
- **Avatar Support**: Display user avatars or auto-generated initials
- **Auto-scroll**: Automatically scrolls to the bottom when new messages arrive
- **Fixed Layout**: Channel selector and message input box remain fixed while messages scroll

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Convex (serverless backend with real-time database)
- **Styling**: Plain CSS with modern layout techniques

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Convex account (free at [convex.dev](https://convex.dev))

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Convex:
   ```bash
   npx convex dev
   ```
   This will:
   - Create a new Convex project
   - Generate your deployment URL
   - Set up the database schema
   - Start the Convex development server

3. Create `.env.local` file:
   ```bash
   cp .env.local.example .env.local
   ```
   Then update `VITE_CONVEX_URL` with your Convex deployment URL (this is automatically set by `npx convex dev`)

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser to `http://localhost:5173`

## Project Structure

```
slack-app/
├── convex/              # Backend functions and schema
│   ├── schema.ts        # Database schema
│   ├── channels.ts      # Channel queries and mutations
│   ├── messages.ts      # Message queries and mutations
│   └── users.ts         # User queries and mutations
├── src/
│   ├── components/      # React components
│   │   ├── ChannelsPanel.tsx    # Channel list and creation
│   │   ├── MessagePane.tsx      # Message display area
│   │   ├── Message.tsx          # Individual message component
│   │   ├── MessageInput.tsx     # Message input box
│   │   ├── SearchBar.tsx        # Search functionality
│   │   └── EditProfile.tsx      # Profile editing
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles
└── package.json
```

## Usage

### Creating Channels
1. Click the "+" button in the channels panel
2. Enter a channel name
3. Click "Create"

### Sending Messages
1. Select a channel from the left panel
2. Type your message in the input box at the bottom
3. Press Enter or click "Send"

### Editing Your Profile
1. Click "Edit Profile" in the top-right
2. Upload a profile photo (JPG, PNG, or GIF, max 5MB)
3. Change your display name
4. Click "Save Name"

### Searching Messages
1. Type your search query in the search bar at the top
2. Results will appear in real-time
3. Click the "✕" button to clear the search

## Database Schema

### Users
- `name`: String - User's display name
- `avatarStorageId`: Optional ID referencing uploaded profile photo

### Channels
- `name`: String - Channel name
- `createdAt`: Number - Timestamp

### Messages
- `channelId`: ID - Reference to channel
- `userId`: ID - Reference to user
- `text`: String - Message content
- `createdAt`: Number - Timestamp

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory, ready to be deployed to your favorite hosting service.

## Deployment

Deploy to Vercel, Netlify, or any static hosting service. Make sure to:
1. Set the `VITE_CONVEX_URL` environment variable
2. Deploy your Convex backend with `npx convex deploy`

## License

MIT
