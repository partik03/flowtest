export interface InterpolationContext {
  saved: Record<string, unknown>;
  dotenvEnv: Record<string, string>;
  cliEnv: Record<string, string>;
  yaml: Record<string, unknown>;
  timestamp?: string;
  random?: {
    string: (length: number) => string;
    number: (min: number, max: number) => number;
  };
}
