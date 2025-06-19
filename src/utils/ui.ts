import ora from 'ora';
import ProgressBar from 'progress';

// Spinner instances
export const testSpinner = ora({
  text: 'Running tests',
  color: 'cyan',
});

export const requestSpinner = ora({
  text: 'Executing request',
  color: 'yellow',
});

// Progress bar for test suite
export function createTestProgressBar(total: number): ProgressBar {
  return new ProgressBar('Running tests [:bar] :current/:total :percent :etas', {
    complete: '█',
    incomplete: ' ',
    width: 30,
    total,
  });
}

// Progress bar for request execution
export function createRequestProgressBar(): ProgressBar {
  return new ProgressBar('Request progress [:bar] :percent :etas', {
    complete: '█',
    incomplete: ' ',
    width: 20,
    total: 100,
  });
}
