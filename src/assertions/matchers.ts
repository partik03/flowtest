import { AssertionResult } from '../types';
import isEqual from 'fast-deep-equal';

export function assertStatus(expected: number, actual: number): AssertionResult {
  if (expected === actual) {
    return {
      passed: true,
      message: `Status code ${actual} matches expected ${expected}`,
    };
  }
  return {
    passed: false,
    message: `Expected status ${expected} but got ${actual}`,
    expected,
    actual,
  };
}

export function assertBody(expected: any, actual: any): AssertionResult {
  if (isEqual(expected, actual)) {
    return {
      passed: true,
      message: 'Response body matches expected',
    };
  }
  return {
    passed: false,
    message: 'Response body does not match expected',
    expected,
    actual,
  };
}

export function assertHeaders(
  expected: Record<string, string>,
  actual?: Record<string, string>
): AssertionResult {
  if (!actual) {
    return {
      passed: false,
      message: 'No headers in response',
      expected,
      actual: {},
    };
  }

  const missingHeaders = Object.keys(expected).filter(
    (key) => !actual[key] || actual[key] !== expected[key]
  );

  if (missingHeaders.length === 0) {
    return {
      passed: true,
      message: 'All expected headers present and match',
    };
  }

  return {
    passed: false,
    message: `Missing or mismatched headers: ${missingHeaders.join(', ')}`,
    expected,
    actual,
  };
}

export function isRegex(value: any): boolean {
  return typeof value === 'string' && /^\/.*\/[gimsuy]*$/.test(value);
}

export function toRegExp(value: string): RegExp {
  const match = value.match(/^\/(.*)\/([gimsuy]*)$/);
  if (!match) throw new Error(`Invalid regex string: ${value}`);
  return new RegExp(match[1], match[2]);
}