import type { MetaFunction } from '@vercel/remix';
import { ClientOnly } from 'remix-utils/client-only';
import { Header } from '~/components/header/Header';
import { ShowcaseGallery } from '~/components/showcase/ShowcaseGallery';

export const meta: MetaFunction = () => {
  return [
    { title: 'Student Showcase | NexAgents' },
    {
      name: 'description',
      content: 'Explore amazing apps built by students using NexAgents',
    },
  ];
};

export default function Showcase() {
  return (
    <div className="flex size-full flex-col bg-bolt-elements-background-depth-1">
      <Header />
      <ClientOnly>{() => <ShowcaseGallery />}</ClientOnly>
    </div>
  );
}
