export const SUGGESTIONS = [
  {
    title: 'Slack clone',
    prompt: `Build an app similar to Slack with the following features:

- Has a channels panel on the left with a button to create new channels
- Has a message pane on the right and a message posting box at the bottom
- Each message has a name and avatar next to it for the author
- Has an "edit profile" tab for uploading a profile photo to Convex storage and changing your name
- Only the messages are scrollable, with message box and channel selector fixed like the header
- Automatically scrolls to the bottom when new messages are sent
- Includes a search bar at the top that queries all messages`,
  },
  {
    title: 'Instagram clone',
    prompt: `Build an app similar to Instagram with a global shared image stream that has these features:

- Has a drag and drop box for uploading images to Convex storage
- Has a "Stream" tab for viewing the global image stream
- Has a "My Photos" tab for viewing and deleting your own images
- Allows liking images in the "Stream" tab
- Shows like count for each image`,
  },
  {
    title: 'Splitwise clone',
    prompt: `Build a group shared expenses app that has the following features:

- Has users, groups, expenses, payments, and reimbursements
- Represents members in a group via a table rather than an array
- Users can create groups and invite other users to join
- Group members can add expenses to a group, which get shared among all members in the group
- Shows a list of members in the group and a list of expenses along with who paid them
- Shows how much every member has been paid and reimbursed
- Each member should be able to record a payment to another member, which adds to how much they have paid and adds to how much the recipient has been reimbursed
- Members should record payments so that every member in the group has the same net balance`,
  },
  {
    title: 'Notion clone',
    prompt: `Make a collaborative text editor like Notion with these features:
- Real-time collaboration where multiple users can edit the same document
- Presence functionality for each document with a facepile
- Document Organization:
- Private documents (only visible to the creator)
- Public documents (visible to all users)
- Simple sidebar navigation between documents
- Full text search over document titles
- Interface:
- Clean, minimal design with lots of white space and a neutral color palette (soft grays and whites)
- Focus on readable text and minimal distractions`,
  },
];

export const EDUCATION_SUGGESTIONS = {
  'Math & Science': [
    {
      title: 'Graphing Calculator',
      prompt: 'Build an interactive graphing calculator that can plot functions, calculate derivatives, and show step-by-step solutions',
    },
    {
      title: 'Physics Simulator',
      prompt: 'Create a physics simulation app with projectile motion, collisions, and gravity simulations with real-time visualization',
    },
    {
      title: 'Chemistry Lab',
      prompt: 'Build a virtual chemistry lab where users can mix compounds, see reactions, and learn about the periodic table',
    },
  ],
  'Language & Reading': [
    {
      title: 'Vocabulary Builder',
      prompt: 'Create a flashcard app with spaced repetition for learning new vocabulary words with images and example sentences',
    },
    {
      title: 'Story Collaboration',
      prompt: 'Build a collaborative story writing platform where multiple users can contribute to stories in real-time',
    },
    {
      title: 'Language Exchange',
      prompt: 'Create a language learning app where students can practice with each other through text and voice chat',
    },
  ],
  'Creative & Design': [
    {
      title: 'Digital Art Studio',
      prompt: 'Build a drawing app with brushes, layers, and color tools for creating digital artwork',
    },
    {
      title: 'Music Composer',
      prompt: 'Create a music composition tool where users can place notes, play melodies, and export their creations',
    },
    {
      title: 'Animation Maker',
      prompt: 'Build a simple animation tool where users can create frame-by-frame animations and export as GIFs',
    },
  ],
  'Computer Science': [
    {
      title: 'Code Editor',
      prompt: 'Build a web-based code editor with syntax highlighting, file management, and live preview',
    },
    {
      title: 'Algorithm Visualizer',
      prompt: 'Create an app that visualizes sorting algorithms, pathfinding, and data structures in real-time',
    },
    {
      title: 'Chat Application',
      prompt: 'Build a real-time chat app with channels, direct messages, file sharing, and user presence',
    },
  ],
  Games: [
    {
      title: 'Multiplayer Quiz',
      prompt: 'Create a Kahoot-style quiz game with real-time multiplayer, leaderboards, and custom question sets',
    },
    {
      title: '2D Platform Game',
      prompt: 'Build a platformer game with physics, collectibles, levels, and character customization',
    },
    {
      title: 'Strategy Game',
      prompt: 'Create a turn-based strategy game with units, resources, and multiplayer battles',
    },
  ],
  Productivity: [
    {
      title: 'Study Planner',
      prompt: 'Build a study planning app with calendar, task management, and progress tracking',
    },
    {
      title: 'Note Taking App',
      prompt: 'Create a rich note-taking app with markdown support, tags, and full-text search',
    },
    {
      title: 'Habit Tracker',
      prompt: 'Build a habit tracking app with streaks, statistics, and motivational features',
    },
  ],
};

export const WORK_DIR_NAME = 'project';
export const WORK_DIR = `/home/${WORK_DIR_NAME}`;

export const PREWARM_PATHS = [
  `${WORK_DIR}/package.json`,
  `${WORK_DIR}/convex/schema.ts`,
  `${WORK_DIR}/src/App.tsx`,
  `${WORK_DIR}/src/index.css`,
  `${WORK_DIR}/src/tailwind.config.js`,
];

// A list of files that we block the LLM from modifying
export const EXCLUDED_FILE_PATHS = [
  'convex/auth.ts',
  'convex/http.ts',
  'src/main.tsx',
  'src/SignInForm.tsx',
  'src/SignOutButton.tsx',
  'vite.config.ts',
  'package.json',
];
