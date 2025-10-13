import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ChallengeCard } from './ChallengeCard';
import type { Id } from '@convex/_generated/dataModel';
import { useState } from 'react';

export function ChallengesList() {
  const featuredChallenge = useQuery(api.challenges.getFeaturedChallenge);
  const allChallenges = useQuery(api.challenges.getAllChallenges);
  const submitChallenge = useMutation(api.challenges.submitChallenge);

  const handleAccept = (challengeId: Id<'challenges'>) => {
    // Start a new chat with the challenge requirements pre-filled
    const challenge = allChallenges?.find((c) => c._id === challengeId);
    if (challenge) {
      const prompt = `I want to build a ${challenge.title.toLowerCase()}.\n\nRequirements:\n${challenge.requirements.map((r) => `- ${r}`).join('\n')}`;
      window.location.href = `/?prompt=${encodeURIComponent(prompt)}`;
    }
  };

  const handleViewSubmissions = (challengeId: Id<'challenges'>) => {
    window.location.href = `/challenges/${challengeId}/submissions`;
  };

  return (
    <div className="min-h-screen bg-bolt-elements-background-depth-1 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-bolt-elements-textPrimary">
            🏆 Monthly Challenges
          </h1>
          <p className="text-lg text-bolt-elements-textSecondary">
            Push your skills to the limit with our monthly coding challenges
          </p>
        </div>

        {/* Featured Challenge */}
        {featuredChallenge && (
          <div className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-bolt-elements-textPrimary">
              This Month's Challenge
            </h2>
            <ChallengeCard
              challenge={featuredChallenge}
              onAccept={handleAccept}
              onViewSubmissions={handleViewSubmissions}
            />
          </div>
        )}

        {/* Previous Challenges */}
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-bolt-elements-textPrimary">
            Previous Challenges
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {allChallenges
              ?.filter((c) => !c.featured)
              .map((challenge) => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onAccept={handleAccept}
                  onViewSubmissions={handleViewSubmissions}
                />
              ))}
          </div>

          {(!allChallenges || allChallenges.filter((c) => !c.featured).length === 0) && (
            <div className="py-12 text-center">
              <p className="text-bolt-elements-textSecondary">
                No previous challenges yet. Check back next month!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
