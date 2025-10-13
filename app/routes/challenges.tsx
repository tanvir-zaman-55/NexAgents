import type { MetaFunction } from '@vercel/remix';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { ChallengesList } from '~/components/challenges/ChallengesList';

export const meta: MetaFunction = () => {
  return [
    { title: 'Challenges | NexAgents' },
    {
      name: 'description',
      content: 'Take on monthly coding challenges and showcase your skills',
    },
  ];
};

export default function Challenges() {
  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <ClientOnly>{() => <ChallengesList />}</ClientOnly>
    </div>
  );
}
