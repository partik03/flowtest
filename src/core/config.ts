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
  return {
    ...projectConfig,
    ...cliOptions,
    // For booleans, handle undefined/false correctly
    parallel: cliOptions.parallel !== undefined ? cliOptions.parallel : projectConfig.parallel,
    watch: cliOptions.watch !== undefined ? cliOptions.watch : projectConfig.watch,
    output: cliOptions.output || projectConfig.output || "console",
    timeout: cliOptions.timeout !== undefined ? Number(cliOptions.timeout) : projectConfig.timeout,
    defaultEnv: cliOptions.defaultEnv || projectConfig.defaultEnv || ".env"
  };
}