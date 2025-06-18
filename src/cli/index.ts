import { InteractiveCommand } from 'interactive-commander';
import runCommand from './commands/run';
import { initCommand } from './commands/init';

export default new InteractiveCommand()
  .name('apiflow')
  .description('Code-first API testing framework')
  .version('1.0.0')
  .helpOption('-h, --help', 'Show help')
  .addCommand(runCommand)
