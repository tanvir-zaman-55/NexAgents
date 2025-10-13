import type { MetaFunction } from '@vercel/remix';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { ClassroomDashboard } from '~/components/classroom/ClassroomDashboard';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';

export const meta: MetaFunction = () => {
  return [
    { title: 'Classroom | NexAgents' },
    {
      name: 'description',
      content: 'Teacher dashboard for monitoring student progress',
    },
  ];
};

export default function Classroom() {
  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <ClientOnly>
        {() => {
          const apiKey = useQuery(api.apiKeys.apiKeyForCurrentMember);
          const memberId = apiKey?._id;

          if (!memberId) {
            return (
              <div className="flex flex-1 items-center justify-center">
                <p className="text-bolt-elements-textSecondary">Please log in to access the classroom</p>
              </div>
            );
          }

          return <ClassroomDashboard teacherId={memberId} />;
        }}
      </ClientOnly>
    </div>
  );
}
