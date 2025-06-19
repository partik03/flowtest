import { parse, stringify } from 'yaml';
import { readFileSync } from 'fs';
import { YamlConfig, InterpolationContext } from '../types';
import { interpolateVariables } from '../utils/variables';

export default class YamlParser {
  private context: InterpolationContext;

  constructor() {
    this.context = {
      yaml: {},
      dotenvEnv: {},
      cliEnv: {},
      saved: {},
      timestamp: new Date().toISOString(),
      random: {
        string: (length = 10) =>
          Math.random()
            .toString(36)
            .substring(2, 2 + length),
        number: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
      },
    };
  }

  parse(
    filePath: string,
    cliEnv: Record<string, string>,
    dotenvEnv: Record<string, string>
  ): YamlConfig {
    try {
      const fileContent = readFileSync(filePath, 'utf8');
      const parsed = parse(fileContent) as YamlConfig;
      this.context.dotenvEnv = dotenvEnv || {};
      this.context.cliEnv = cliEnv || {};
      if (parsed.variables && Object.keys(parsed.variables).length > 0) {
        this.context.yaml = parsed.variables || {};
      }
      this.validateConfig(parsed);
      return interpolateVariables(parsed, this.context);
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  stringify(config: YamlConfig): string {
    return stringify(config);
  }

  private validateConfig(config: YamlConfig): void {
    if (!config.name) {
      throw new Error('Config must have a name');
    }
    if (!config.tests || !config.tests?.length)
      throw new Error('Config must have at least one test case');

    config.tests.forEach((test, index) => {
      if (!test.name) throw new Error(`Test case ${index + 1} must have a name`);
      if (!test.request?.method || !test.request?.url)
        throw new Error(`Test case ${index + 1} must have a request method and url`);
      if (!test.expect?.statusCode)
        throw new Error(`Test case ${index + 1} must have an expected status code`);

      if (test.expect.statusCode < 100 || test.expect.statusCode >= 600) {
        throw new Error(
          `Invalid status code: ${test.expect.statusCode} for test case ${index + 1}`
        );
      }

      if (test.expect.headers) {
        Object.keys(test.expect.headers).forEach((key) => {
          if (
            typeof test.expect.headers[key] !== 'string' &&
            typeof test.expect.headers[key] !== 'object'
          ) {
            throw new Error(
              `Invalid header value: ${test.expect.headers[key]} for test case ${index + 1}`
            );
          }
        });
      }

      if (test.expect.body) {
        if (typeof test.expect.body !== 'string' && typeof test.expect.body !== 'object') {
          throw new Error(`Invalid body value: ${test.expect.body} for test case ${index + 1}`);
        }
      }
    });
  }
}
