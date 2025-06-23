import { InteractiveCommand } from 'interactive-commander';
import { promptForTestSetup, InitOptions } from '../../prompts/test-setup';
import { renderTemplate } from '../../utils/template';
import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import boxen from 'boxen';

export default new InteractiveCommand()
  .command('init')
  .description('Initialize a new APIFlow test suite')
  .action(async () => {
    try {
      // Get user input through interactive prompts
      const options = await promptForTestSetup();
      
      // Create tests directory if it doesn't exist
      const testsDir = 'tests';
      await fs.mkdir(testsDir, { recursive: true });
      
      // Prepare variables for template substitution
      const variables = {
        suiteName: options.suiteName,
        baseUrl: options.baseUrl,
        testName: options.testName
      };
      
      const createdFiles: string[] = [];
      
      // Generate test file
      const testFilePath = path.join(testsDir, `${options.suiteName}.yaml`);
      const testTemplate = await loadTestTemplate();
      const renderedTest = renderTemplate(testTemplate, variables);
      await fs.writeFile(testFilePath, renderedTest, 'utf-8');
      createdFiles.push(testFilePath);
      
      // Generate .env file if requested
      if (options.createEnvFile) {
        const envTemplate = await loadEnvTemplate();
        await fs.writeFile('.env', envTemplate, 'utf-8');
        createdFiles.push('.env');
      }
      
      // Generate apiflow.config.js if requested
      if (options.createConfigFile) {
        const configTemplate = await loadConfigTemplate();
        const renderedConfig = renderTemplate(configTemplate, variables);
        await fs.writeFile('apiflow.config.js', renderedConfig, 'utf-8');
        createdFiles.push('apiflow.config.js');
      }
      
      // Display success message
      displaySuccessMessage(createdFiles, options.suiteName);
      
    } catch (error) {
      console.error(chalk.red('❌ Error initializing test suite:'), error);
      process.exit(1);
    }
  });

async function loadTestTemplate(): Promise<string> {
  const templatePath = path.join(process.cwd(), 'src', 'templates', 'default-test.yaml');
  try {
    return await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    // Fallback to inline template if file not found
    return `name: {{suiteName}}
baseUrl: {{baseUrl}}

tests:
  - name: {{testName}}
    request:
      method: GET
      url: /ping
    expect:
      status: 200
      body:
        message: "pong"
      responseTime: 1000

  - name: get-users
    request:
      method: GET
      url: /users
      headers:
        Authorization: "Bearer {{API_KEY}}"
    expect:
      status: 200
      body:
        type: "array"
      headers:
        content-type: "application/json"
      responseTime: 2000

  - name: create-user
    request:
      method: POST
      url: /users
      headers:
        Content-Type: "application/json"
        Authorization: "Bearer {{API_KEY}}"
      body:
        name: "John Doe"
        email: "john@example.com"
    expect:
      status: 201
      body:
        name: "John Doe"
        email: "john@example.com"
      saveAs:
        userId: "$.id"`;
  }
}

async function loadEnvTemplate(): Promise<string> {
  const templatePath = path.join(process.cwd(), 'src', 'templates', 'env.example');
  try {
    return await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    // Fallback to inline template if file not found
    return `# API Configuration
API_KEY=your_api_key_here
API_SECRET=your_api_secret_here

# Environment
NODE_ENV=development

# Custom Variables
USER_EMAIL=test@example.com
USER_PASSWORD=testpassword123`;
  }
}

async function loadConfigTemplate(): Promise<string> {
  const templatePath = path.join(process.cwd(), 'src', 'templates', 'apiflow.config.js');
  try {
    return await fs.readFile(templatePath, 'utf-8');
  } catch (error) {
    // Fallback to inline template if file not found
    return `module.exports = {
  baseURL: "{{baseUrl}}",
  timeout: 10000,
  defaultEnv: ".env",
  parallel: false,
  output: "console",
  watch: false
};`;
  }
}

function displaySuccessMessage(createdFiles: string[], suiteName: string): void {
  const message = chalk.green.bold('🎉 APIFlow test suite initialized!\n\n') +
    createdFiles.map(file => chalk.cyan(`📄 ${file}`)).join('\n') +
    chalk.yellow('\n\nNext steps:') +
    chalk.white('\n1. Edit your test file: ') + chalk.cyan(`tests/${suiteName}.yaml`) +
    chalk.white('\n2. Update environment variables in ') + chalk.cyan('.env') +
    chalk.white('\n3. Run your tests: ') + chalk.cyan(`apiflow run tests/${suiteName}.yaml`) +
    chalk.white('\n4. For help: ') + chalk.cyan('apiflow --help');

  console.log(boxen(message, {
    padding: 1,
    margin: 1,
    borderStyle: 'round',
    borderColor: 'green'
  }));
}

// Legacy export for backward compatibility
export async function initCommand() {
  console.log('Initializing new test configuration');
}