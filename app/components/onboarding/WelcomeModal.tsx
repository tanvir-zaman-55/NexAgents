import { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Button } from '@ui/Button';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { Id } from '@convex/_generated/dataModel';

interface WelcomeModalProps {
  memberId: Id<'convexMembers'> | null;
  onClose: () => void;
}

export function WelcomeModal({ memberId, onClose }: WelcomeModalProps) {
  const [accountType, setAccountType] = useState<'personal' | 'education' | 'other'>('personal');
  const [educationRole, setEducationRole] = useState<'student' | 'teacher' | 'neither' | undefined>(
    undefined,
  );
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const setUserPreferences = useMutation(api.userPreferences.setUserPreferences);

  const handleAccountTypeChange = (type: 'personal' | 'education' | 'other') => {
    setAccountType(type);
    setShowRoleSelection(type === 'education');
    if (type !== 'education') {
      setEducationRole(undefined);
    }
  };

  const handleContinue = async () => {
    if (!memberId) {
      onClose();
      return;
    }

    try {
      await setUserPreferences({
        memberId,
        accountType,
        educationRole,
        showLearningAssistant: accountType === 'education',
      });
      localStorage.setItem('welcomeModalSeen', 'true');
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative mx-4 w-full max-w-md rounded-lg bg-bolt-elements-background-depth-1 p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="mb-6 text-center">
          <h2 className="mb-2 text-3xl font-bold text-bolt-elements-textPrimary">
            Welcome to NexAgents 🚀
          </h2>
          <p className="text-bolt-elements-textSecondary">Build Real Apps. Learn By Creating.</p>
        </div>

        <div className="mb-6">
          <p className="mb-4 text-sm text-bolt-elements-textSecondary">I want to use this for:</p>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center rounded-lg border border-bolt-elements-borderColor p-4 transition-colors hover:border-bolt-elements-item-backgroundAccent">
              <input
                type="radio"
                name="accountType"
                value="personal"
                checked={accountType === 'personal'}
                onChange={() => handleAccountTypeChange('personal')}
                className="mr-3 h-4 w-4"
              />
              <div>
                <div className="font-medium text-bolt-elements-textPrimary">Personal Projects</div>
                <div className="text-sm text-bolt-elements-textSecondary">Just for me</div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center rounded-lg border border-bolt-elements-borderColor p-4 transition-colors hover:border-bolt-elements-item-backgroundAccent">
              <input
                type="radio"
                name="accountType"
                value="education"
                checked={accountType === 'education'}
                onChange={() => handleAccountTypeChange('education')}
                className="mr-3 h-4 w-4"
              />
              <div>
                <div className="font-medium text-bolt-elements-textPrimary">Education</div>
                <div className="text-sm text-bolt-elements-textSecondary">I'm a student or teacher</div>
              </div>
            </label>

            <label className="flex cursor-pointer items-center rounded-lg border border-bolt-elements-borderColor p-4 transition-colors hover:border-bolt-elements-item-backgroundAccent">
              <input
                type="radio"
                name="accountType"
                value="other"
                checked={accountType === 'other'}
                onChange={() => handleAccountTypeChange('other')}
                className="mr-3 h-4 w-4"
              />
              <div>
                <div className="font-medium text-bolt-elements-textPrimary">Other</div>
              </div>
            </label>
          </div>
        </div>

        {showRoleSelection && (
          <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="mb-4 text-sm text-bolt-elements-textSecondary">Your role:</p>
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="educationRole"
                  value="student"
                  checked={educationRole === 'student'}
                  onChange={(e) => setEducationRole(e.target.value as 'student')}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-bolt-elements-textPrimary">Student</span>
              </label>
              <label className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="educationRole"
                  value="teacher"
                  checked={educationRole === 'teacher'}
                  onChange={(e) => setEducationRole(e.target.value as 'teacher')}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-bolt-elements-textPrimary">Teacher</span>
              </label>
              <label className="flex cursor-pointer items-center">
                <input
                  type="radio"
                  name="educationRole"
                  value="neither"
                  checked={educationRole === 'neither'}
                  onChange={(e) => setEducationRole(e.target.value as 'neither')}
                  className="mr-2 h-4 w-4"
                />
                <span className="text-bolt-elements-textPrimary">Neither</span>
              </label>
            </div>
          </div>
        )}

        <Button onClick={handleContinue} className="w-full" variant="primary">
          Continue
        </Button>

        <p className="mt-4 text-center text-xs text-bolt-elements-textSecondary">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
}
