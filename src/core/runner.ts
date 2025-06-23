import chalk from 'chalk';
import { executeRequest } from '../http/client';
import { assertResponse } from '../assertions';
import { YamlConfig, InterpolationContext } from '../types';
import { testSpinner, createTestProgressBar } from '../utils/ui';
import {
  APIFlowError,
  HTTPError,
  NetworkError,
  TimeoutError,
  ValidationError,
} from '../utils/errors';
import { interpolateVariables } from '../utils/variables';

export default async function runTests(
  config: YamlConfig,
  cliEnv: Record<string, string>,
  dotEnv: Record<string, string>,
  filterFn ?: (testName: string) => boolean,
  defaultTimeout?: number
): Promise<any[]> {
  try {
    const results: any[] = [];

    // Start test suite spinner
    testSpinner.start('Loading test configuration');
    testSpinner.succeed('Configuration loaded');
    const saved: Record<string, unknown> = {};
    const yamlVars: Record<string, unknown> = config.variables || {};

    // Create progress bar for test suite
    const progressBar = createTestProgressBar(config.tests.length);

    let passed = 0;
    let failed = 0;

    const filteredTests = filterFn ? config.tests.filter((t) => filterFn(t.name)) : config.tests;

    // Run each test
    for (const test of filteredTests) {
      const context: InterpolationContext = {
        saved: saved,
        dotenvEnv: dotEnv,
        cliEnv: cliEnv,
        yaml: yamlVars,
      };
      try {
        console.log(`\n🧪 Running test: ${test.name}`);
        const interpolatedTest = interpolateVariables(test, context);
        const startTime = Date.now();
        const testTimeout = test.request.timeout !== undefined ? test.request.timeout : defaultTimeout || 10000;
        const response = await executeRequest(interpolatedTest, config.baseUrl || '', testTimeout);
        const duration = Date.now() - startTime;
        const testContext = { responseTime: duration };
        const result = assertResponse(test, response, saved, testContext);

        progressBar.tick();
        // Log test result
        if (result.passed) {
          console.log(chalk.green(`✅ ${test.name} [PASS]`));
          passed++;
        } else {
          console.log(chalk.red(`❌ ${test.name} [FAIL]`));
          console.log(chalk.red(`   ${result.message}`));
          if (result.expected !== undefined && result.actual !== undefined) {
            console.log(chalk.yellow('   Expected:'), result.expected);
            console.log(chalk.yellow('   Actual:  '), result.actual);
          }
          failed++;
        }
        results.push({
          test: test.name,
          passed: result.passed,
          message: result.message,
          expected: result.expected,
          actual: result.actual,
        });
      } catch (error: any) {
        progressBar.tick();
        results.push({
          test: test.name,
          passed: false,
          message: error.message,
          expected: undefined,
          actual: undefined,
        });
        console.log(chalk.red(`\n❌ ${test.name} [ERROR]`));
        console.log(chalk.red(`   ${error.message}`));
        failed++;
        if (error instanceof HTTPError) {
          console.error(`\n❌ Test "${test.name}" failed with HTTP error:`);
          console.error(`Status: ${error.statusCode}`);
          console.error(`Message: ${error.statusText}`);
          if (error.response) {
            console.error('Response:', error.response);
          }
        } else if (error instanceof NetworkError) {
          console.error(`\n❌ Test "${test.name}" failed with network error:`);
          console.error(error.message);
        } else if (error instanceof TimeoutError) {
          console.error(`\n❌ Test "${test.name}" failed with timeout:`);
          console.error(error.message);
        } else if (error instanceof ValidationError) {
          console.error(`\n❌ Test "${test.name}" failed validation:`);
          console.error(error.message);
        } else {
          console.error(`\n❌ Test "${test.name}" failed with unexpected error:`);
          console.error(error);
        }
      }
    }
    return results;
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`Total: ${config.tests.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
  } catch (error) {
    testSpinner.fail('Test execution failed');
    if (error instanceof APIFlowError) {
      console.error('Test execution failed:', error.message);
    } else {
      console.error('Unexpected error during test execution:', error);
    }
    throw error;
  }
}
