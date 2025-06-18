import { executeRequest } from '../http/client';
import { YamlConfig } from '../types';
import { testSpinner, createTestProgressBar } from '../utils/ui';
import { 
    APIFlowError, 
    HTTPError, 
    NetworkError, 
    TimeoutError, 
    ValidationError 
  } from '../utils/errors';


export default async function runTests(config: YamlConfig): Promise<void> {
  try {
    // Start test suite spinner
    testSpinner.start('Loading test configuration');
    testSpinner.succeed('Configuration loaded');


    // Create progress bar for test suite
    const progressBar = createTestProgressBar(config.tests.length);
    
    let passed = 0;
    let failed = 0;

    // Run each test
    for (const test of config.tests) {
      try {
        console.log(`\n🧪 Running test: ${test.name}`);

        const result = await executeRequest(test, config.baseUrl || '');
        progressBar.tick();
        // Log test result
        console.log(`\n✅ Test "${test.name}" completed`);
        console.log(`Duration: ${result.duration}ms`);
        passed++;
      } catch (error) {
        progressBar.tick();
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