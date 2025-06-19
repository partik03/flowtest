import path from 'path';
import fs from 'fs';

export interface ProjectConfig {
  defaultEnv?: string;
  defaultOutput?: string;
  baseURL?: string;
  timeout?: number;
  [key: string]: any;
}

export function loadProjectConfig(): ProjectConfig {
  const configPath = path.resolve(process.cwd(), 'apiflow.config.js');
  if (fs.existsSync(configPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const config = require(configPath);
    return config || {};
  }
  return {};
}

export function mergeConfig(cliOptions: Record<string, any>, projectConfig: ProjectConfig): ProjectConfig {
  // CLI flags take precedence
  return { ...projectConfig, ...cliOptions };
}