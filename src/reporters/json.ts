export class JsonReporter {
  report(allResults: { file: string; results: any[] }[]) {
    let total = 0,
      passed = 0,
      failed = 0;
    const results: any[] = [];
    for (const { file, results: fileResults } of allResults) {
      for (const result of fileResults) {
        total++;
        if (result.passed) passed++;
        else failed++;
        results.push({
          file,
          test: result.testName,
          status: result.passed ? 'passed' : 'failed',
          error: result.passed ? undefined : result.message,
        });
      }
    }
    return {
      summary: { total, passed, failed },
      results,
    };
  }
}
