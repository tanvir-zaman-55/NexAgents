import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ProjectCard } from './ProjectCard';
import type { Id } from '@convex/_generated/dataModel';
import { Button } from '@ui/Button';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type CategoryFilter = 'all' | 'Games' | 'Social' | 'Tools' | 'Creative' | 'Education';
type ComplexityFilter = 'all' | 1 | 2 | 3 | 4 | 5;
type SortBy = 'featured' | 'complex' | 'creative' | 'popular';

export function ShowcaseGallery() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [complexityFilter, setComplexityFilter] = useState<ComplexityFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('featured');
  const [searchTerm, setSearchTerm] = useState('');

  const featuredProjects = useQuery(api.studentProjects.getFeaturedProjects);
  const categoryProjects =
    categoryFilter !== 'all'
      ? useQuery(api.studentProjects.getProjectsByCategory, { category: categoryFilter })
      : null;

  const likeProject = useMutation(api.studentProjects.likeProject);

  const handleLike = (projectId: Id<'studentProjects'>) => {
    likeProject({ projectId });
  };

  const handleView = (projectId: Id<'studentProjects'>) => {
    // Navigate to project view
    window.location.href = `/project/${projectId}`;
  };

  const handleRemix = (projectId: Id<'studentProjects'>) => {
    // Fork/remix the project
    window.location.href = `/remix/${projectId}`;
  };

  const displayProjects = categoryFilter === 'all' ? featuredProjects : categoryProjects;

  return (
    <div className="min-h-screen bg-bolt-elements-background-depth-1 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-bolt-elements-textPrimary">
            🌟 Amazing Apps Built by Students
          </h1>
          <p className="text-lg text-bolt-elements-textSecondary">
            Real, full-featured applications created by students around the world
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-bolt-elements-textSecondary" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 py-3 pl-10 pr-4 text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary focus:border-bolt-elements-focus focus:outline-none"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Category Filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-bolt-elements-textSecondary">Category:</h3>
            <div className="flex flex-wrap gap-2">
              {(['all', 'Games', 'Social', 'Tools', 'Creative', 'Education'] as CategoryFilter[]).map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      categoryFilter === category
                        ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
                        : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
                    }`}
                  >
                    {category === 'all' ? 'All' : category}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Complexity Filter */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-bolt-elements-textSecondary">Complexity:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setComplexityFilter('all')}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  complexityFilter === 'all'
                    ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
                    : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
                }`}
              >
                All
              </button>
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => setComplexityFilter(level as ComplexityFilter)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    complexityFilter === level
                      ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
                      : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
                  }`}
                >
                  {'⭐'.repeat(level)}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="mb-2 text-sm font-medium text-bolt-elements-textSecondary">Sort by:</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'featured', label: '⭐ Featured' },
                { key: 'complex', label: '🏆 Most Complex' },
                { key: 'creative', label: '💡 Most Creative' },
                { key: 'popular', label: '❤️ Most Popular' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as SortBy)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    sortBy === key
                      ? 'bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text'
                      : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {displayProjects && displayProjects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onLike={handleLike}
                onView={handleView}
                onRemix={handleRemix}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-lg text-bolt-elements-textSecondary">
              No projects found. Be the first to showcase your work!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
