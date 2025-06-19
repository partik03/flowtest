import fs from 'fs/promises';
import path from 'path';

export async function discoverTestFiles(inputPath: string): Promise<string[]> {
  const results: string[] = [];
  async function walk(currentPath: string) {
    const stat = await fs.stat(currentPath);
    if (stat.isDirectory()) {
      const entries = await fs.readdir(currentPath);
      for (const entry of entries) {
        await walk(path.join(currentPath, entry));
      }
    } else if (stat.isFile() && (currentPath.endsWith('.yaml') || currentPath.endsWith('.yml'))) {
      results.push(currentPath);
    }
  }
  await walk(inputPath);
  return results;
}
