import { Chat } from './chat/Chat';
import { ChefAuthProvider } from './chat/ChefAuthWrapper';
import { useRef, useState, useEffect } from 'react';
import { useConvexChatHomepage } from '~/lib/stores/startup';
import { Toaster } from '~/components/ui/Toaster';
import { setPageLoadChatId } from '~/lib/stores/chatId';
import type { Message } from '@ai-sdk/react';
import type { PartCache } from '~/lib/hooks/useMessageParser';
import { UserProvider } from '~/components/UserProvider';
import { WelcomeModal } from './onboarding/WelcomeModal';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export function Homepage() {
  // Set up a temporary chat ID early in app initialization. We'll
  // eventually replace this with a slug once we receive the first
  // artifact from the model if the user submits a prompt.
  const initialId = useRef(crypto.randomUUID());
  setPageLoadChatId(initialId.current);
  // NB: On this path, we render `ChatImpl` immediately.
  return (
    <>
      <ChefAuthProvider redirectIfUnauthenticated={false}>
        <UserProvider>
          <ChatWrapper initialId={initialId.current} />
        </UserProvider>
      </ChefAuthProvider>
      <Toaster />
    </>
  );
}

const ChatWrapper = ({ initialId }: { initialId: string }) => {
  const partCache = useRef<PartCache>(new Map());
  const { storeMessageHistory, initializeChat, initialMessages, subchats } = useConvexChatHomepage(initialId);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Get current member info to pass to modal
  const apiKey = useQuery(api.apiKeys.apiKeyForCurrentMember);
  const memberId = apiKey?._id ? apiKey._id : null;

  useEffect(() => {
    // Check if user has seen the welcome modal
    const hasSeenWelcome = localStorage.getItem('welcomeModalSeen');
    if (!hasSeenWelcome && memberId) {
      // Small delay to let the page load first
      setTimeout(() => setShowWelcomeModal(true), 1000);
    }
  }, [memberId]);

  return (
    <>
      <Chat
        initialMessages={initialMessages ?? emptyList}
        partCache={partCache.current}
        storeMessageHistory={storeMessageHistory}
        initializeChat={initializeChat}
        isReload={false}
        hadSuccessfulDeploy={false}
        subchats={subchats}
      />
      {showWelcomeModal && (
        <WelcomeModal memberId={memberId} onClose={() => setShowWelcomeModal(false)} />
      )}
    </>
  );
};

const emptyList: Message[] = [];
