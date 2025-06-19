export interface AssertionResult {
  passed: boolean;
  message: string;
  expected?: any;
  actual?: any;
  savedVariables?: Record<string, any>;
}
