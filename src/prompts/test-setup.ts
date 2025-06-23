import inquirer from 'inquirer';
import chalk from 'chalk';

export interface InitOptions {
  suiteName: string;
  baseUrl: string;
  testName: string;
  createEnvFile: boolean;
  createConfigFile: boolean;
}

export async function promptForTestSetup(): Promise<InitOptions> {
  console.log(chalk.blue.bold('\n🧪 APIFlow Test Suite Initialization\n'));
  console.log(chalk.gray('This will create a new test suite with sample configuration.\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'suiteName',
      message: 'Test suite name:',
      default: 'my-api-tests',
      validate: (input: string) => {
        if (!input.trim()) return 'Suite name is required';
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return 'Suite name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'baseUrl',
      message: 'Base URL for your API:',
      default: 'http://localhost:3000',
      validate: (input: string) => {
        if (!input.trim()) return 'Base URL is required';
        try {
          new URL(input);
          return true;
        } catch {
          return 'Please enter a valid URL (e.g., http://localhost:3000)';
        }
      }
    },
    {
      type: 'input',
      name: 'testName',
      message: 'First test name:',
      default: 'health-check',
      validate: (input: string) => {
        if (!input.trim()) return 'Test name is required';
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) {
          return 'Test name can only contain letters, numbers, hyphens, and underscores';
        }
        return true;
      }
    },
    {
      type: 'confirm',
      name: 'createEnvFile',
      message: 'Create .env file for environment variables?',
      default: true
    },
    {
      type: 'confirm',
      name: 'createConfigFile',
      message: 'Create apiflow.config.js with default configuration?',
      default: true
    }
  ]);

  return answers as InitOptions;
} 