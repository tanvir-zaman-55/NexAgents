import { mkdirSync, writeFileSync, readFileSync, readdirSync, statSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';

/**
 * Creates a temporary directory for a chat project
 * and syncs WebContainer files to it for Claude Code access
 */
export class WebContainerSync {
  private projectDir: string;

  constructor(chatInitialId: string) {
    // Create temp directory for this chat
    const tempBase = join(os.tmpdir(), 'chef-projects');
    this.projectDir = join(tempBase, chatInitialId);

    try {
      mkdirSync(this.projectDir, { recursive: true });
      console.log(`📁 Created project directory: ${this.projectDir}`);
    } catch (error) {
      console.error('Failed to create project directory:', error);
    }
  }

  /**
   * Get the filesystem path where Claude Code should work
   */
  getProjectPath(): string {
    return this.projectDir;
  }

  /**
   * Write files to the project directory
   * This should be called with the current WebContainer state
   */
  writeFiles(files: Record<string, string>): void {
    try {
      for (const [path, content] of Object.entries(files)) {
        const fullPath = join(this.projectDir, path);
        const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));

        // Create parent directories
        mkdirSync(dir, { recursive: true });

        // Write file
        writeFileSync(fullPath, content, 'utf-8');
      }

      console.log(`✅ Synced ${Object.keys(files).length} files to ${this.projectDir}`);
    } catch (error) {
      console.error('Failed to write files:', error);
    }
  }

  /**
   * Read all files from the project directory
   * This should be called after Claude Code modifies files
   * Returns files that should be synced back to WebContainer
   */
  readFiles(): Record<string, string> {
    const files: Record<string, string> = {};

    const readDir = (dir: string, baseDir: string = this.projectDir) => {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const relativePath = fullPath.substring(baseDir.length + 1);

        // Skip node_modules, .git, etc.
        if (entry === 'node_modules' || entry === '.git' || entry.startsWith('.')) {
          continue;
        }

        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          readDir(fullPath, baseDir);
        } else {
          try {
            files[relativePath] = readFileSync(fullPath, 'utf-8');
          } catch (error) {
            console.warn(`Could not read ${relativePath}:`, error);
          }
        }
      }
    };

    try {
      readDir(this.projectDir);
      console.log(`✅ Read ${Object.keys(files).length} files from ${this.projectDir}`);
    } catch (error) {
      console.error('Failed to read files:', error);
    }

    return files;
  }

  /**
   * Clean up the temporary directory
   */
  cleanup(): void {
    try {
      rmSync(this.projectDir, { recursive: true, force: true });
      console.log(`🗑️  Cleaned up project directory: ${this.projectDir}`);
    } catch (error) {
      console.warn('Failed to cleanup directory:', error);
    }
  }

  /**
   * Write a basic package.json if one doesn't exist
   */
  ensurePackageJson(): void {
    const packageJsonPath = join(this.projectDir, 'package.json');
    try {
      readFileSync(packageJsonPath);
    } catch {
      // File doesn't exist, create a basic one
      writeFileSync(
        packageJsonPath,
        JSON.stringify(
          {
            name: 'chef-project',
            version: '0.0.0',
            type: 'module',
            dependencies: {
              convex: '^1.17.0',
              react: '^18.3.1',
            },
          },
          null,
          2
        )
      );
    }
  }
}
