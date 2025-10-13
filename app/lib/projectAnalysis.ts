export interface ProjectComplexity {
  complexity: 1 | 2 | 3 | 4 | 5;
  skills: string[];
  category: string;
}

export interface FileInfo {
  path: string;
  content: string;
}

export function analyzeProjectComplexity(files: FileInfo[]): ProjectComplexity {
  let score = 1;
  const skills: Set<string> = new Set(['React', 'TypeScript']);
  let category = 'General';

  const allContent = files.map((f) => f.content).join('\n');

  // Check for database usage
  const hasDatabase = /ctx\.db\.(query|insert|patch|delete|get)/.test(allContent);
  const hasSchema = files.some((f) => f.path.includes('schema.ts'));
  if (hasDatabase || hasSchema) {
    score++;
    skills.add('Database Design');
    skills.add('Convex');
  }

  // Check for authentication
  const hasAuth =
    /getAuthUserId|ConvexAuth|authTables/.test(allContent) ||
    files.some((f) => f.path.includes('auth'));
  if (hasAuth) {
    score++;
    skills.add('Authentication');
    skills.add('Security');
  }

  // Check for real-time features
  const hasRealtime =
    /useQuery|useMutation|useAction/.test(allContent) ||
    /subscribe|live/.test(allContent);
  if (hasRealtime) {
    score++;
    skills.add('Real-time Updates');
  }

  // Check for API integrations
  const hasAPI =
    /fetch\(|axios|httpAction/.test(allContent) ||
    files.some((f) => f.path.includes('api'));
  if (hasAPI) {
    score++;
    skills.add('API Integration');
  }

  // Check for file storage
  const hasStorage = /ctx\.storage|generateUploadUrl/.test(allContent);
  if (hasStorage) {
    score++;
    skills.add('File Storage');
  }

  // Check for complex algorithms
  const hasComplexAlgorithms =
    /algorithm|sort|search|graph|tree|recursive/.test(allContent);
  if (hasComplexAlgorithms) {
    score++;
    skills.add('Algorithms');
  }

  // Check for AI/ML
  const hasAI = /openai|anthropic|ai|ml|machine learning/.test(allContent.toLowerCase());
  if (hasAI) {
    score += 2;
    skills.add('AI Integration');
    skills.add('Advanced');
  }

  // Determine category based on content
  if (/game|player|score|level/.test(allContent.toLowerCase())) {
    category = 'Games';
  } else if (/chat|message|social|post|comment|like/.test(allContent.toLowerCase())) {
    category = 'Social';
  } else if (/todo|task|note|calendar|planner/.test(allContent.toLowerCase())) {
    category = 'Productivity';
  } else if (/draw|paint|art|music|animation/.test(allContent.toLowerCase())) {
    category = 'Creative';
  } else if (/learn|study|education|quiz|flashcard/.test(allContent.toLowerCase())) {
    category = 'Education';
  } else if (/shop|store|product|cart|payment/.test(allContent.toLowerCase())) {
    category = 'E-commerce';
  }

  // Additional complexity for file count
  if (files.length > 10) score++;
  if (files.length > 20) score++;

  // Cap at 5
  const finalComplexity = Math.min(score, 5) as 1 | 2 | 3 | 4 | 5;

  return {
    complexity: finalComplexity,
    skills: Array.from(skills),
    category,
  };
}

export function getComplexityLabel(complexity: number): string {
  switch (complexity) {
    case 1:
      return 'Beginner';
    case 2:
      return 'Intermediate';
    case 3:
      return 'Advanced';
    case 4:
      return 'Expert';
    case 5:
      return 'Master';
    default:
      return 'Unknown';
  }
}

export function getComplexityDescription(complexity: number): string {
  switch (complexity) {
    case 1:
      return 'Uses basic UI components and simple logic';
    case 2:
      return 'Includes database operations and state management';
    case 3:
      return 'Features authentication, real-time updates, and API calls';
    case 4:
      return 'Implements complex architecture, advanced features, and optimizations';
    case 5:
      return 'Showcases cutting-edge technology, AI integration, and expert-level implementation';
    default:
      return 'Complexity level unknown';
  }
}
