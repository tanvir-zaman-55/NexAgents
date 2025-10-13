import { useState } from 'react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  LightBulbIcon,
  AcademicCapIcon,
  BookOpenIcon,
  QuestionMarkCircleIcon,
  ShareIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@ui/Button';

interface LearningAssistantPanelProps {
  projectType?: string;
  filesCount?: number;
  hasDatabase?: boolean;
  hasAuth?: boolean;
  hasRealtime?: boolean;
}

export function LearningAssistantPanel({
  projectType = 'Unknown',
  filesCount = 0,
  hasDatabase = false,
  hasAuth = false,
  hasRealtime = false,
}: LearningAssistantPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const skills = [];
  if (filesCount > 0) skills.push('React', 'TypeScript');
  if (hasDatabase) skills.push('Database Design', 'Convex Queries');
  if (hasAuth) skills.push('Authentication');
  if (hasRealtime) skills.push('Real-time Updates', 'WebSockets');

  if (isCollapsed) {
    return (
      <div className="flex h-full w-12 flex-col items-center border-l border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="rounded-lg p-2 text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-3 hover:text-bolt-elements-textPrimary"
          title="Expand Learning Assistant"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <div className="mt-4 rotate-180 text-sm font-medium text-bolt-elements-textSecondary" style={{ writingMode: 'vertical-lr' }}>
          Learning Assistant
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-80 flex-col border-l border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-bolt-elements-borderColor px-4 py-3">
        <h3 className="font-semibold text-bolt-elements-textPrimary">Learning Assistant</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="rounded-lg p-1 text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-3 hover:text-bolt-elements-textPrimary"
          title="Collapse"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* What You're Building */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <LightBulbIcon className="h-5 w-5 text-yellow-500" />
              <h4 className="font-medium text-bolt-elements-textPrimary">What you're building</h4>
            </div>
            <p className="text-sm text-bolt-elements-textSecondary">
              {projectType === 'Unknown'
                ? 'Start building to see insights about your project!'
                : `A ${projectType.toLowerCase()} application with real-time features and database integration.`}
            </p>
          </div>

          {/* Skills You're Learning */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <AcademicCapIcon className="h-5 w-5 text-blue-500" />
              <h4 className="font-medium text-bolt-elements-textPrimary">Skills you're learning</h4>
            </div>
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-bolt-elements-background-depth-3 px-3 py-1 text-xs text-bolt-elements-textPrimary"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-bolt-elements-textSecondary">
                Start coding to unlock new skills!
              </p>
            )}
          </div>

          {/* Resources */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-bolt-elements-textPrimary">Resources</h4>
            </div>
            <div className="space-y-2">
              <a
                href="https://docs.convex.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-bolt-elements-background-depth-3 p-2 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-4"
              >
                📚 Convex Documentation
              </a>
              <a
                href="https://react.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-bolt-elements-background-depth-3 p-2 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-4"
              >
                ⚛️ React Docs
              </a>
              <a
                href="https://www.typescriptlang.org/docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg bg-bolt-elements-background-depth-3 p-2 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-4"
              >
                📘 TypeScript Handbook
              </a>
            </div>
          </div>

          {/* Get Help */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <QuestionMarkCircleIcon className="h-5 w-5 text-purple-500" />
              <h4 className="font-medium text-bolt-elements-textPrimary">Get Help</h4>
            </div>
            <div className="space-y-2">
              <Button
                variant="neutral"
                className="w-full justify-start"
                size="sm"
                icon={<QuestionMarkCircleIcon className="h-4 w-4" />}
              >
                Ask AI
              </Button>
              <Button
                variant="neutral"
                className="w-full justify-start"
                size="sm"
                icon={<AcademicCapIcon className="h-4 w-4" />}
              >
                Ask Teacher
              </Button>
            </div>
          </div>

          {/* Portfolio */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <ShareIcon className="h-5 w-5 text-orange-500" />
              <h4 className="font-medium text-bolt-elements-textPrimary">Portfolio</h4>
            </div>
            <div className="space-y-2">
              <Button
                variant="primary"
                className="w-full justify-start"
                size="sm"
                icon={<PlusCircleIcon className="h-4 w-4" />}
              >
                Add to Portfolio
              </Button>
              <Button
                variant="neutral"
                className="w-full justify-start"
                size="sm"
                icon={<ShareIcon className="h-4 w-4" />}
              >
                Share Project
              </Button>
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-lg bg-bolt-elements-background-depth-3 p-3">
            <p className="mb-2 text-xs font-medium text-bolt-elements-textPrimary">💡 Pro Tip</p>
            <p className="text-xs text-bolt-elements-textSecondary">
              Use Convex's real-time subscriptions to make your app update automatically when data changes!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
