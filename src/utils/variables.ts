import { randomBytes } from 'crypto';
import { InterpolationContext } from '../types';

export function interpolateVariables<T>(obj: T, context: InterpolationContext): T {
  if (typeof obj === 'string') {
    return interpolateString(obj, context) as T;
  }
  // Handle null/undefined
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateVariables(item, context)) as T;
  }

  // Handle objects
  if (typeof obj === 'object') {
    const result = {} as T;
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        result[key as keyof T] = interpolateString(value, context) as any;
      } else if (typeof value === 'object' && value !== null) {
        result[key as keyof T] = interpolateVariables(value, context);
      } else {
        result[key as keyof T] = value as any;
      }
    }
    return result;
  }

  const result = {} as T;
  for (const [key, value] of Object.entries(obj)) {
    result[key as keyof T] = interpolateVariables(value, context);
  }
  return result;
}

export function interpolateString(str: string, context: InterpolationContext): string {
  if (!str.includes('{{')) {
    return str;
  }
  return str.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
    // Handle random.string(length)
    if (path.startsWith('random.string')) {
      const lengthMatch = path.match(/random\.string\((\d+)\)/);
      const length = lengthMatch ? parseInt(lengthMatch[1]) : 10;
      return Math.random()
        .toString(36)
        .substring(2, length + 2);
    }

    // Handle random.number(min,max)
    if (path.startsWith('random.number')) {
      const numbersMatch = path.match(/random\.number\((\d+),(\d+)\)/);
      if (numbersMatch) {
        const min = parseInt(numbersMatch[1]);
        const max = parseInt(numbersMatch[2]);
        return String(Math.floor(Math.random() * (max - min + 1)) + min);
      }
    }

    if (path.startsWith('saveAs:')) {
      // Handle saveAs variable - we'll implement this later
      return match;
    }

    if (path in context.saved && context.saved[path] !== undefined) {
      return String(context.saved[path]);
    }

    if (path in context.yaml && context.yaml[path] !== undefined) {
      return String(context.yaml[path]);
    }
    if (path in context.cliEnv && context.cliEnv[path] !== undefined) {
      return String(context.cliEnv[path]);
    }

    if (path in context.dotenvEnv && context.dotenvEnv[path] !== undefined) {
      return String(context.dotenvEnv[path]);
    }

    throw new Error(`Variable ${path} not found`);
  });
}

export function extractSaveAsFields(expected: any, actual: any): [any, any, Record<string, any>] {
  if (typeof expected === 'string' && expected.startsWith('{{saveAs:') && expected.endsWith('}}')) {
    const varName = expected.slice(9, -2);
    if (actual === undefined) throw new Error(`saveAs: Cannot extract value for ${varName}`);
    return [undefined, undefined, { [varName]: actual }];
  }
  if (typeof expected !== 'object' || expected === null) return [expected, actual, {}];
  if (Array.isArray(expected)) {
    let newVars = {};
    const expArr = [];
    const actArr = [];
    for (let i = 0; i < expected.length; i++) {
      const [e, a, vars] = extractSaveAsFields(expected[i], actual?.[i]);
      expArr.push(e);
      actArr.push(a);
      newVars = { ...newVars, ...vars };
    }
    return [expArr, actArr, newVars];
  }
  let newVars = {};
  const expObj: any = {};
  const actObj: any = {};
  for (const key of Object.keys(expected)) {
    const [e, a, vars] = extractSaveAsFields(expected[key], actual?.[key]);
    if (e !== undefined) expObj[key] = e;
    if (a !== undefined) actObj[key] = a;
    newVars = { ...newVars, ...vars };
  }
  return [expObj, actObj, newVars];
}

// export function createInterpolationContext(
//   envVars: Record<string, string>,
//   cliEnv: Record<string, string> = {},
//   yamlVars: Record<string, unknown> = {}
// ): InterpolationContext {
//   return {
//     dotenvEnv: envVars,
//     cliEnv: cliEnv,
//     yaml: yamlVars,
//     saved: {},
//     random: {
//       string: (length: number) => randomBytes(length).toString('hex').slice(0, length),
//       number: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min
//     }
//   };
// }

// export function interpolateVariables(
//   input: unknown,
//   context: InterpolationContext
// ): unknown {
//   if (typeof input !== 'string') {
//     return input;
//   }

//   return input.replace(/\{\{([^}]+)\}\}/g, (_, variable) => {
//     // Handle random functions
//     if (variable.startsWith('random.')) {
//       const [_, func, args] = variable.match(/random\.(\w+)\((.*)\)/) || [];
//       if (func === 'string') {
//         return String(context.random.string(parseInt(args, 10)));
//       }
//       if (func === 'number') {
//         const [min, max] = args.split(',').map(Number);
//         return String(context.random.number(min, max));
//       }
//     }

//     // Handle saveAs syntax
//     if (variable.startsWith('saveAs:')) {
//       const varName = variable.slice(7);
//       context.test[varName] = input;
//       return String(input);
//     }

//     // Check test variables first
//     if (variable in context.test) {
//       return String(context.test[variable]);
//     }

//     // Then check environment variables
//     if (variable in context.env) {
//       return String(context.env[variable]);
//     }

//     throw new Error(`Missing variable: ${variable}`);
//   });
// }

// export function interpolateObject(
//   obj: Record<string, unknown>,
//   context: InterpolationContext
// ): Record<string, unknown> {
//   const result: Record<string, unknown> = {};

//   for (const [key, value] of Object.entries(obj)) {
//     if (typeof value === 'object' && value !== null) {
//       result[key] = interpolateObject(value as Record<string, unknown>, context);
//     } else {
//       result[key] = interpolateVariables(value, context);
//     }
//   }

//   return result;
// }
