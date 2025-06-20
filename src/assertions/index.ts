// import { TestCase } from '../types';
// import { HttpResponse } from '../types';
// import { assertStatus, assertBody, assertHeaders, isRegex, toRegExp } from './matchers';
// import { AssertionResult } from '../types';
// import { extractSaveAsFields } from '../utils/variables';
// import { formatAssertionError } from './assertionError';

// export function assertResponse(
//   test: TestCase,
//   actual: HttpResponse,
//   saved: Record<string, any>
// ): AssertionResult {
//   const { expect } = test;
//   const results: AssertionResult[] = [];

//   // Assert status code
//   if (expect.statusCode !== undefined) {
//     const statusResult = assertStatus(expect.statusCode, actual.statusCode);
//     results.push(statusResult);
//   }

//   // Assert headers
//   if (expect.headers !== undefined) {
//     const headersResult = assertHeaders(expect.headers, actual.headers);
//     results.push(headersResult);
//   }

//   let savedVariables: Record<string, any> = {};

//   // Assert body
//   if (expect.body !== undefined) {
//     const [expectedBody, actualBody, vars] = extractSaveAsFields(expect.body, actual.body);
//     savedVariables = { ...savedVariables, ...vars };

//     const bodyResult = assertBody(expectedBody, actualBody);
//     results.push(bodyResult);
//   }
//   // Combine results
//   const failedResult = results.find((r) => !r.passed);
//   if (failedResult) {
//     return failedResult;
//   }

//   if (Object.keys(savedVariables).length > 0) {
//     Object.assign(saved, savedVariables);
//   }

//   return {
//     passed: true,
//     message: 'All assertions passed',
//     savedVariables: Object.keys(savedVariables).length > 0 ? savedVariables : undefined,
//   };
// }


import { TestCase } from '../types';
import { HttpResponse } from '../types';
import { AssertionResult } from '../types';
import { extractSaveAsFields } from '../utils/variables';
import { formatAssertionError } from './assertionError';
import { isRegex, toRegExp } from './matchers';
import { deepCompare } from './deepCompare';
import { jsonpathAssertions } from './jsonpath';

export function assertResponse(
  test: TestCase,
  actual: HttpResponse,
  saved: Record<string, any>,
  testContext?: { responseTime?: number }
): AssertionResult {
  const { expect } = test;
  const results: AssertionResult[] = [];
  let savedVariables: Record<string, any> = {};

  // Status code
  if (expect.statusCode !== undefined) {
    if (expect.statusCode !== actual.statusCode) {
      return {
        passed: false,
        message: formatAssertionError(['statusCode'], expect.statusCode, actual.statusCode),
        expected: expect.statusCode,
        actual: actual.statusCode,
        path: ['statusCode'],
      };
    }
  }

  // Response time
  // if (expect.responseTime !== undefined && testContext?.responseTime !== undefined) {
  //   if (testContext.responseTime > expect.responseTime) {
  //     return {
  //       passed: false,
  //       message: formatAssertionError(['responseTime'], `<${expect.responseTime}`, testContext.responseTime),
  //       expected: `<${expect.responseTime}`,
  //       actual: testContext.responseTime,
  //       path: ['responseTime'],
  //     };
  //   }
  // }

  // Headers
  if (expect.headers !== undefined) {
    for (const [key, expectedValue] of Object.entries(expect.headers)) {
      const actualValue = actual.headers?.[key];
      if (isRegex(expectedValue)) {
        const regex = toRegExp(expectedValue as string);
        if (!regex.test(actualValue)) {
          return {
            passed: false,
            message: formatAssertionError(['headers', key], expectedValue, actualValue),
            expected: expectedValue,
            actual: actualValue,
            path: ['headers', key],
          };
        }
      } else if (actualValue !== expectedValue) {
        return {
          passed: false,
          message: formatAssertionError(['headers', key], expectedValue, actualValue),
          expected: expectedValue,
          actual: actualValue,
          path: ['headers', key],
        };
      }
    }
  }

  // JSONPath assertions
  if (expect.jsonpath) {
    const jsonpathResults = jsonpathAssertions(actual.body, expect.jsonpath);
    const failed = jsonpathResults.find(r => !r.passed);
    if (failed) return failed;
  }

  // Body (deep compare, regex-aware, saveAs support)
  if (expect.body !== undefined) {
    const [expectedBody, actualBody, vars] = extractSaveAsFields(expect.body, actual.body);
    savedVariables = { ...savedVariables, ...vars };
    const bodyResult = deepCompare(actualBody, expectedBody, ['body']);
    if (!bodyResult.passed) {
      return {
        ...bodyResult,
        message: formatAssertionError(bodyResult.path || ['body'], bodyResult.expected, bodyResult.actual),
      };
    }
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