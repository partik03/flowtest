import chalk from 'chalk';
import boxen from 'boxen';

export function formatAssertionError(path: string[], expected: any, actual: any): string {
  return boxen(
    [
      chalk.red(`✖ ${path.join('.') || 'value'}`),
      chalk.green('  Expected: ') + JSON.stringify(expected),
      chalk.red('  Received: ') + JSON.stringify(actual),
    ].join('\n'),
    { padding: 1, borderColor: 'red' }
  );
}