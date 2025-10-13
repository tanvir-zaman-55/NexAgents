import { Button } from '@ui/Button';
import { ArrowUpIcon } from '@radix-ui/react-icons';
import { SUGGESTIONS, EDUCATION_SUGGESTIONS } from 'chef-agent/constants';
import { useState } from 'react';

interface SuggestionButtonsProps {
  chatStarted: boolean;
  onSuggestionClick?: (suggestion: string) => void;
  disabled?: boolean;
}

type TabType = 'all' | 'education' | 'business';

export const SuggestionButtons = ({ chatStarted, onSuggestionClick, disabled }: SuggestionButtonsProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');

  if (chatStarted) {
    return null;
  }

  return (
    <div id="suggestions" className="w-full">
      {/* Tab Navigation */}
      <div className="mb-6 flex justify-center gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
              : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
          }`}
        >
          🚀 All Apps
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'education'
              ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
              : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
          }`}
        >
          🎓 Education
        </button>
        <button
          onClick={() => setActiveTab('business')}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'business'
              ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
              : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
          }`}
        >
          💼 Business
        </button>
      </div>

      {/* All Apps Tab */}
      {activeTab === 'all' && (
        <div className="flex flex-wrap justify-center gap-4">
          {SUGGESTIONS.map((suggestion) => (
            <Button
              key={suggestion.title}
              onClick={() => onSuggestionClick?.(suggestion.prompt)}
              className="rounded-full px-3 shadow-sm"
              variant="neutral"
              disabled={disabled}
              icon={<ArrowUpIcon className="size-4" />}
            >
              {suggestion.title}
            </Button>
          ))}
          <Button
            onClick={() => onSuggestionClick?.('Build me a custom app from scratch')}
            className="rounded-full px-3 shadow-sm"
            variant="primary"
            disabled={disabled}
            icon={<ArrowUpIcon className="size-4" />}
          >
            Custom App
          </Button>
        </div>
      )}

      {/* Education Tab */}
      {activeTab === 'education' && (
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-bolt-elements-textPrimary">
              What Students Are Building
            </h3>
            <p className="text-sm text-bolt-elements-textSecondary">
              Real, full-featured applications - not toy projects
            </p>
          </div>

          {Object.entries(EDUCATION_SUGGESTIONS).map(([category, suggestions]) => (
            <div key={category}>
              <h4 className="mb-3 text-sm font-medium text-bolt-elements-textPrimary">
                {category === 'Math & Science' && '📐 Math & Science'}
                {category === 'Language & Reading' && '📚 Language & Reading'}
                {category === 'Creative & Design' && '🎨 Creative & Design'}
                {category === 'Computer Science' && '💻 Computer Science'}
                {category === 'Games' && '🎮 Games & Entertainment'}
                {category === 'Productivity' && '📱 Productivity & Tools'}
              </h4>
              <div className="flex flex-wrap gap-3">
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion.title}
                    onClick={() => onSuggestionClick?.(suggestion.prompt)}
                    className="rounded-full px-3 shadow-sm"
                    variant="neutral"
                    disabled={disabled}
                    icon={<ArrowUpIcon className="size-4" />}
                  >
                    {suggestion.title}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          <div className="mt-6 text-center">
            <Button
              onClick={() => onSuggestionClick?.('Build me a custom educational app from scratch')}
              className="rounded-full px-4 shadow-sm"
              variant="primary"
              disabled={disabled}
              icon={<ArrowUpIcon className="size-4" />}
            >
              Start from Scratch - Build Anything!
            </Button>
          </div>
        </div>
      )}

      {/* Business Tab */}
      {activeTab === 'business' && (
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold text-bolt-elements-textPrimary">
              Business Applications
            </h3>
            <p className="text-sm text-bolt-elements-textSecondary">
              Professional tools and platforms
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {[
              { title: 'CRM System', prompt: 'Build a customer relationship management system with contacts, deals pipeline, and task management' },
              { title: 'E-commerce Platform', prompt: 'Create an online store with product catalog, shopping cart, checkout, and payment processing' },
              { title: 'Project Management', prompt: 'Build a project management tool like Asana with boards, tasks, timelines, and team collaboration' },
              { title: 'Analytics Dashboard', prompt: 'Create a data analytics dashboard with charts, metrics, and real-time data visualization' },
              { title: 'Booking System', prompt: 'Build a reservation and booking platform with calendar, availability, and payment integration' },
              { title: 'Inventory Manager', prompt: 'Create an inventory management system with stock tracking, suppliers, and reporting' },
            ].map((suggestion) => (
              <Button
                key={suggestion.title}
                onClick={() => onSuggestionClick?.(suggestion.prompt)}
                className="rounded-full px-3 shadow-sm"
                variant="neutral"
                disabled={disabled}
                icon={<ArrowUpIcon className="size-4" />}
              >
                {suggestion.title}
              </Button>
            ))}
          </div>

          <div className="text-center">
            <Button
              onClick={() => onSuggestionClick?.('Build me a custom business application from scratch')}
              className="rounded-full px-4 shadow-sm"
              variant="primary"
              disabled={disabled}
              icon={<ArrowUpIcon className="size-4" />}
            >
              Custom Business App
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
