import { YamlParser } from '../../parsers';
import { InteractiveCommand, InteractiveOption } from 'interactive-commander';
import fs from 'fs';
import { runTests } from '../../core';
import { testSpinner } from '../../utils/ui';
import { config as dotenvConfig } from 'dotenv';
import { discoverTestFiles } from '../../utils/discover';
import { ConsoleReporter } from '../../reporters/console';
import { JsonReporter } from '../../reporters/json';

const yamlParser = new YamlParser();

export default new InteractiveCommand()
  .command('run')
  .description('Run API tests')
  .argument('<file>', 'Path to the YAML file containing the test configuration')
  .option('--env <vars...>', 'Environment variables to override (format: KEY=VALUE)')
  .option('--output <format>', 'Output format: console|json', 'console')
  .option('--out <file>', 'Write JSON output to file')
  .action(async (inputPath: string, options: { env?: string[]; output?: string; out?: string }) => {
    // if(!filePath) {
    //     console.error('No file path provided');
    //     return;
    // }
    // if(!filePath.endsWith('.yaml') && !filePath.endsWith('.yml')) {
    //     console.error('Invalid file type. Please provide a YAML file.');
    //     return;
    // }
    // if(!fs.existsSync(filePath)) {
    //     console.error(`File not found: ${filePath}`);
    //     return;
    // }
    const cliEnv: Record<string, string> = {};
    try {
      dotenvConfig({ path: '.env' });
      if (options.env) {
        for (const envVar of options.env) {
          const [key, value] = envVar.split('=');
          if (!key || !value) {
            throw new Error(`Invalid environment variable format: ${envVar}`);
          }
          cliEnv[key] = value;
        }
      }
    } catch (error) {
      console.error(`Error getting env variables: ${error}`);
      return;
    }

    const dotEnv: Record<string, string> = {};
    for (const [key, value] of Object.entries(process.env)) {
      if (typeof value === 'string') {
        dotEnv[key] = value;
      }
    }
    // Discover test files
    let testFiles: string[] = [];
    const stat = fs.statSync(inputPath);
    if (stat.isDirectory()) {
      testFiles = await discoverTestFiles(inputPath);
    } else {
      testFiles = [inputPath];
    }

    const allResults = [];
    try {
      for (const filePath of testFiles) {
        const config = yamlParser.parse(filePath, cliEnv, dotEnv);
        testSpinner.succeed('Configuration loaded');
        console.log(`\n�� Running tests from: ${filePath}`);
        const results = await runTests(config, cliEnv, dotEnv);
        allResults.push({ file: filePath, results });
      }
    } catch (error) {
      console.error(`Error parsing YAML file: ${error}`);
      return;
    }

    // // Reporting
    if (options.output === 'json') {
      const reporter = new JsonReporter();
      const jsonReport = reporter.report(allResults);
      if (options.out) {
        fs.writeFileSync(options.out, JSON.stringify(jsonReport, null, 2));
        console.log(`JSON results written to ${options.out}`);
      } else {
        console.log(JSON.stringify(jsonReport, null, 2));
      }
    } else {
      const reporter = new ConsoleReporter();
      reporter.report(allResults);
    }
  });
