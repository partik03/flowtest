import { JSONPath } from 'jsonpath-plus';
import { AssertionResult } from '../types';

export function jsonpathAssertions(actualBody: any, jsonpathExpect: Record<string, any>): AssertionResult[] {
  const results: AssertionResult[] = [];
  for (const [path, expected] of Object.entries(jsonpathExpect)) {
    let actual;
    try {
      const found = JSONPath({ path, json: actualBody });
      if (found.length === 0) {
        results.push({
          passed: false,
          message: `JSONPath ${path} not found in response`,
          expected,
          actual: undefined,
          path: [path],
        });
        continue;
      }
      actual = found[0];
    } catch (err) {
      results.push({
        passed: false,
        message: `Invalid JSONPath: ${path}`,
        expected,
        actual: undefined,
        path: [path],
      });
      continue;
    }
    if (actual !== expected) {
      results.push({
        passed: false,
        message: `JSONPath ${path} expected ${expected} but got ${actual}`,
        expected,
        actual,
        path: [path],
      });
    } else {
      results.push({
        passed: true,
        message: `JSONPath ${path} matched`,
        expected,
        actual,
        path: [path],
      });
    }
  }
  return results;
}