import { HttpResponse, HttpRequest } from '../http';

export interface YamlConfig {
  name: string;
  baseUrl?: string;
  variables?: Record<string, unknown>;
  tests: TestCase[];
  description?: string;
}

export interface TestCase {
  name: string;
  request: HttpRequest;
  expect: HttpResponse;
}

export interface RuntimeContext {
  variables: Record<string, unknown>;
}
