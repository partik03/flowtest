import { TestCase } from '../types';
import { HttpResponse } from '../types';
import { assertStatus, assertBody, assertHeaders } from './matchers';
import { AssertionResult } from '../types';
import { extractSaveAsFields } from '../utils/variables';

export function assertResponse(
  test: TestCase,
  actual: HttpResponse,
  saved: Record<string, any>
): AssertionResult {
  const { expect } = test;
  const results: AssertionResult[] = [];

  // Assert status code
  if (expect.statusCode !== undefined) {
    const statusResult = assertStatus(expect.statusCode, actual.statusCode);
    results.push(statusResult);
  }

  // Assert headers
  if (expect.headers !== undefined) {
    const headersResult = assertHeaders(expect.headers, actual.headers);
    results.push(headersResult);
  }

  let savedVariables: Record<string, any> = {};

  // Assert body
  if (expect.body !== undefined) {
    const [expectedBody, actualBody, vars] = extractSaveAsFields(expect.body, actual.body);
    savedVariables = { ...savedVariables, ...vars };

    const bodyResult = assertBody(expectedBody, actualBody);
    results.push(bodyResult);
  }
  // Combine results
  const failedResult = results.find((r) => !r.passed);
  if (failedResult) {
    return failedResult;
  }

  if (Object.keys(savedVariables).length > 0) {
    Object.assign(saved, savedVariables);
  }

  return {
    passed: true,
    message: 'All assertions passed',
    savedVariables: Object.keys(savedVariables).length > 0 ? savedVariables : undefined,
  };
}
