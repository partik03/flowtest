import { InteractiveCommand } from 'interactive-commander';
import runCommand from './commands/run';
import { initCommand } from './commands/init';

export default new InteractiveCommand()
  .name('apiflow')
  .description('Code-first API testing framework')
  .version('1.0.0')
  .helpOption('-h, --help', 'Show help')
  .addCommand(runCommand)
//   .addCommand('run')
//   .description('Run API tests')
//   .argument('[file]', 'Test file to run')
//   .action(runCommand);

// program
//   .command('init')
//   .description('Initialize a new test configuration')
//   .action(initCommand);
