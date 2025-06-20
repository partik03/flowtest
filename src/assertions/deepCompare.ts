import { AssertionResult } from '../types';
import { isRegex, toRegExp } from './matchers';

export function deepCompare(actual: any, expected: any, path: string[] = []): AssertionResult {
  if (isRegex(expected)) {
    const regex = toRegExp(expected);
    if (typeof actual !== 'string' || !regex.test(actual)) {
      return {
        passed: false,
        message: `Value at ${path.join('.')} does not match regex`,
        expected,
        actual,
        path: [...path],
      };
    }
    return { passed: true, message: 'Regex match', path: [...path] };
  }

  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      return {
        passed: false,
        message: `Array length mismatch at ${path.join('.')}`,
        expected,
        actual,
        path: [...path],
      };
    }
    for (let i = 0; i < expected.length; i++) {
      const res = deepCompare(actual[i], expected[i], [...path, String(i)]);
      if (!res.passed) return res;
    }
    return { passed: true, message: 'Array match', path: [...path] };
  }

  if (expected && typeof expected === 'object') {
    if (!actual || typeof actual !== 'object') {
      return {
        passed: false,
        message: `Expected object at ${path.join('.')}`,
        expected,
        actual,
        path: [...path],
      };
    }
    for (const key of Object.keys(expected)) {
      const res = deepCompare(actual[key], expected[key], [...path, key]);
      if (!res.passed) return res;
    }
    return { passed: true, message: 'Object match', path: [...path] };
  }

  if (actual !== expected) {
    return {
      passed: false,
      message: `Value mismatch at ${path.join('.')}`,
      expected,
      actual,
      path: [...path],
    };
  }
  return { passed: true, message: 'Value match', path: [...path] };
}