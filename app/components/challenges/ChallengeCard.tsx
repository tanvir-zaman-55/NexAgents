import { Button } from '@ui/Button';
import { CheckCircleIcon, SparklesIcon, TrophyIcon } from '@heroicons/react/24/outline';
import type { Id } from '@convex/_generated/dataModel';

interface ChallengeCardProps {
  challenge: {
    _id: Id<'challenges'>;
    title: string;
    description: string;
    requirements: string[];
    bonusFeatures: string[];
    month: string;
    year: number;
    prize: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    featured: boolean;
  };
  onAccept?: (challengeId: Id<'challenges'>) => void;
  onViewSubmissions?: (challengeId: Id<'challenges'>) => void;
}

const difficultyColors = {
  beginner: 'bg-green-500/10 text-green-500',
  intermediate: 'bg-blue-500/10 text-blue-500',
  advanced: 'bg-orange-500/10 text-orange-500',
  expert: 'bg-red-500/10 text-red-500',
};

export function ChallengeCard({ challenge, onAccept, onViewSubmissions }: ChallengeCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-lg border p-6 ${
      challenge.featured
        ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/5 to-transparent'
        : 'border-bolt-elements-borderColor bg-bolt-elements-background-depth-2'
    }`}>
      {challenge.featured && (
        <div className="absolute right-4 top-4">
          <SparklesIcon className="h-6 w-6 text-yellow-500" />
        </div>
      )}

      <div className="mb-4">
        <div className="mb-2 flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${difficultyColors[challenge.difficulty]}`}>
            {challenge.difficulty.toUpperCase()}
          </span>
          <span className="text-sm text-bolt-elements-textTertiary">
            {challenge.month} {challenge.year}
          </span>
        </div>
        <h3 className="mb-2 text-2xl font-bold text-bolt-elements-textPrimary">{challenge.title}</h3>
        <p className="text-bolt-elements-textSecondary">{challenge.description}</p>
      </div>

      <div className="mb-4">
        <h4 className="mb-2 text-sm font-semibold text-bolt-elements-textPrimary">Requirements:</h4>
        <ul className="space-y-1">
          {challenge.requirements.map((req, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-bolt-elements-textSecondary">
              <CheckCircleIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      </div>

      {challenge.bonusFeatures.length > 0 && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-semibold text-bolt-elements-textPrimary">
            ⭐ Bonus Features:
          </h4>
          <ul className="space-y-1">
            {challenge.bonusFeatures.map((bonus, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-bolt-elements-textTertiary">
                <span>•</span>
                <span>{bonus}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4 rounded-lg bg-bolt-elements-background-depth-3 p-3">
        <div className="flex items-center gap-2">
          <TrophyIcon className="h-5 w-5 text-yellow-500" />
          <span className="font-medium text-bolt-elements-textPrimary">Prize:</span>
          <span className="text-bolt-elements-textSecondary">{challenge.prize}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onAccept?.(challenge._id)}
          variant="primary"
          className="flex-1"
        >
          Accept Challenge
        </Button>
        <Button
          onClick={() => onViewSubmissions?.(challenge._id)}
          variant="neutral"
        >
          View Submissions
        </Button>
      </div>
    </div>
  );
}
