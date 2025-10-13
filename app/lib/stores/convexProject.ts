import { atom } from 'nanostores';
import type { ConvexProject } from 'chef-agent/types';

export const convexProjectStore = atom<ConvexProject | null>(null);

export function waitForConvexProjectConnection(): Promise<ConvexProject> {
  return new Promise((resolve, reject) => {
    if (convexProjectStore.get() !== null) {
      resolve(convexProjectStore.get()!);
      return;
    }

    // Add a timeout to prevent waiting forever (30 seconds)
    const timeout = setTimeout(() => {
      unsubscribe();
      reject(new Error('Timeout waiting for Convex project connection. Project may still be provisioning.'));
    }, 30000);

    const unsubscribe = convexProjectStore.subscribe((project) => {
      if (project !== null) {
        clearTimeout(timeout);
        unsubscribe();
        resolve(project);
      }
    });
  });
}
