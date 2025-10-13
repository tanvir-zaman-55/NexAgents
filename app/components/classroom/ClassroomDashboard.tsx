import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { useState } from 'react';
import { Button } from '@ui/Button';
import { PlusIcon } from '@heroicons/react/24/outline';

interface ClassroomDashboardProps {
  teacherId: Id<'convexMembers'>;
}

export function ClassroomDashboard({ teacherId }: ClassroomDashboardProps) {
  const classrooms = useQuery(api.classrooms.getTeacherClassrooms, { teacherId });
  const [selectedClassroom, setSelectedClassroom] = useState<Id<'classrooms'> | null>(null);

  const selectedClassroomData = classrooms?.find((c) => c._id === selectedClassroom);
  const studentProjects = useQuery(
    selectedClassroom && selectedClassroomData
      ? api.classrooms.getStudentProjects
      : 'skip',
    selectedClassroom && selectedClassroomData
      ? { studentIds: selectedClassroomData.studentIds }
      : 'skip',
  );

  return (
    <div className="min-h-screen bg-bolt-elements-background-depth-1 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-bolt-elements-textPrimary">
              👨‍🏫 Classroom Dashboard
            </h1>
            <p className="text-lg text-bolt-elements-textSecondary">
              Monitor student progress and provide guidance
            </p>
          </div>
          <Button icon={<PlusIcon className="h-4 w-4" />} variant="primary">
            Create Class
          </Button>
        </div>

        {/* My Classes */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-bolt-elements-textPrimary">My Classes</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classrooms?.map((classroom) => (
              <button
                key={classroom._id}
                onClick={() => setSelectedClassroom(classroom._id)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  selectedClassroom === classroom._id
                    ? 'border-bolt-elements-button-primary-background bg-bolt-elements-background-depth-2'
                    : 'border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 hover:border-bolt-elements-textSecondary'
                }`}
              >
                <h3 className="mb-1 font-semibold text-bolt-elements-textPrimary">{classroom.name}</h3>
                <p className="text-sm text-bolt-elements-textSecondary">
                  {classroom.studentIds.length} student{classroom.studentIds.length !== 1 ? 's' : ''}
                </p>
                {classroom.gradeLevel && (
                  <p className="mt-1 text-xs text-bolt-elements-textTertiary">{classroom.gradeLevel}</p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Recent Student Projects */}
        {selectedClassroom && (
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-bolt-elements-textPrimary">
              Recent Student Projects
            </h2>
            <div className="space-y-4">
              {studentProjects?.map((project) => (
                <div
                  key={project._id}
                  className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-5"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-bolt-elements-textPrimary">
                        {project.title}
                      </h3>
                      <p className="text-sm text-bolt-elements-textSecondary">By {project.authorName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-bolt-elements-textSecondary">
                        Complexity: {'⭐'.repeat(project.complexity)}
                      </span>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-bolt-elements-textSecondary">{project.description}</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {project.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full bg-bolt-elements-background-depth-3 px-2 py-1 text-xs text-bolt-elements-textPrimary"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="neutral" size="sm">
                      View Code
                    </Button>
                    <Button variant="primary" size="sm">
                      Provide Feedback
                    </Button>
                    {project.complexity >= 4 && (
                      <Button variant="neutral" size="sm">
                        Showcase This!
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics */}
        {selectedClassroom && selectedClassroomData && (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-6">
              <div className="mb-2 text-3xl font-bold text-bolt-elements-textPrimary">
                {selectedClassroomData.studentIds.length}
              </div>
              <div className="text-sm text-bolt-elements-textSecondary">Active Students</div>
            </div>
            <div className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-6">
              <div className="mb-2 text-3xl font-bold text-bolt-elements-textPrimary">
                {studentProjects?.length || 0}
              </div>
              <div className="text-sm text-bolt-elements-textSecondary">Projects in Progress</div>
            </div>
            <div className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-6">
              <div className="mb-2 text-3xl font-bold text-bolt-elements-textPrimary">
                {studentProjects?.filter((p) => p.complexity >= 4).length || 0}
              </div>
              <div className="text-sm text-bolt-elements-textSecondary">Advanced Projects</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
