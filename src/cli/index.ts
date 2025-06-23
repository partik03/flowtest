import { InteractiveCommand } from 'interactive-commander';
import runCommand from './commands/run';
import initCommand from './commands/init';
import chalk from 'chalk';

export default new InteractiveCommand()
  .name('apiflow')
  .description("APIFlow: Code-first API testing CLI")
  .version("1.0.0")
  .addCommand(runCommand)
  .addCommand(initCommand)
  .helpOption("-h, --help", "Show help")
  .on('--help', () => {
    console.log(chalk.bold("\nOptions:"));
    console.log("  --env KEY=VALUE           Override environment variables");
    console.log("  --output [console|json]   Choose output format");
    console.log("  --grep \"pattern\"          Run tests matching a name");
    console.log("  --watch                   Watch test files and rerun on change");
    console.log("  --parallel                Run test files in parallel");
    console.log("  --out <filename>          Save output to file");
  });
