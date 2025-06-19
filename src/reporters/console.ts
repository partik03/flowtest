import chalk from 'chalk';

export class ConsoleReporter {
  report(allResults: { file: string; results: any[] }[]) {
    let total = 0,
      passed = 0,
      failed = 0;
    for (const { file, results } of allResults) {
      console.log(chalk.bold.underline(file));
      for (const result of results) {
        total++;
        if (result.passed) {
          passed++;
          console.log(chalk.green(`  ✔ ${result.test}`));
        } else {
          failed++;
          console.log(chalk.red(`  ✖ ${result.test} - ${result.message}`));
        }
      }
      console.log('');
    }
    console.log(
      chalk.bold(
        `Summary: ${total} tests run, ${chalk.green(`${passed} passed`)}, ${chalk.red(`${failed} failed`)}`
      )
    );
  }
}
