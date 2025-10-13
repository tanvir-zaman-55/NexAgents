import { Button } from '@ui/Button';
import { HeartIcon, EyeIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import type { Id } from '@convex/_generated/dataModel';
import { useState } from 'react';

interface ProjectCardProps {
  project: {
    _id: Id<'studentProjects'>;
    title: string;
    description: string;
    authorName: string;
    authorGrade?: string;
    authorSchool?: string;
    category: string;
    complexity: number;
    skills: string[];
    likes: number;
    thumbnailStorageId?: Id<'_storage'>;
  };
  onLike?: (projectId: Id<'studentProjects'>) => void;
  onView?: (projectId: Id<'studentProjects'>) => void;
  onRemix?: (projectId: Id<'studentProjects'>) => void;
}

export function ProjectCard({ project, onLike, onView, onRemix }: ProjectCardProps) {
  const [liked, setLiked] = useState(false);
  const complexityStars = '⭐'.repeat(project.complexity);

  const handleLike = () => {
    setLiked(!liked);
    onLike?.(project._id);
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-5 shadow-sm transition-all hover:shadow-md">
      {/* Thumbnail or Placeholder */}
      <div className="mb-4 aspect-video w-full overflow-hidden rounded-md bg-bolt-elements-background-depth-3">
        {project.thumbnailStorageId ? (
          <img
            src={`/api/storage/${project.thumbnailStorageId}`}
            alt={project.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">
            <CodeBracketIcon className="h-20 w-20 text-bolt-elements-textSecondary" />
          </div>
        )}
      </div>

      {/* Project Info */}
      <div className="mb-3">
        <h3 className="mb-1 text-lg font-semibold text-bolt-elements-textPrimary">{project.title}</h3>
        <p className="mb-2 line-clamp-2 text-sm text-bolt-elements-textSecondary">{project.description}</p>

        <div className="mb-2 text-sm text-bolt-elements-textTertiary">
          By {project.authorName}
          {project.authorGrade && `, ${project.authorGrade}`}
          {project.authorSchool && ` • ${project.authorSchool}`}
        </div>
      </div>

      {/* Complexity & Skills */}
      <div className="mb-3 space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-bolt-elements-textSecondary">Complexity:</span>
          <span className="text-sm">{complexityStars}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {project.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-bolt-elements-background-depth-3 px-2 py-0.5 text-xs text-bolt-elements-textSecondary"
            >
              {skill}
            </span>
          ))}
          {project.skills.length > 3 && (
            <span className="rounded-full bg-bolt-elements-background-depth-3 px-2 py-0.5 text-xs text-bolt-elements-textSecondary">
              +{project.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-bolt-elements-borderColor pt-3">
        <button
          onClick={handleLike}
          className="flex items-center gap-1.5 text-sm text-bolt-elements-textSecondary transition-colors hover:text-red-500"
        >
          {liked ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5" />
          )}
          <span>{project.likes + (liked ? 1 : 0)}</span>
        </button>

        <div className="flex gap-2">
          <Button
            onClick={() => onView?.(project._id)}
            size="xs"
            variant="neutral"
            icon={<EyeIcon className="h-4 w-4" />}
          >
            View
          </Button>
          <Button
            onClick={() => onRemix?.(project._id)}
            size="xs"
            variant="primary"
            icon={<CodeBracketIcon className="h-4 w-4" />}
          >
            Remix
          </Button>
        </div>
      </div>
    </div>
  );
}
