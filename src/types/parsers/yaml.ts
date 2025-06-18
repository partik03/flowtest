import { HttpResponse, HttpRequest } from "./http";


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

export interface VariableContext {
    variables: Record<string, unknown>;
    timestamp?: string;
    random?: {
        string?: (length?: number) => string;
        number?: (min: number, max: number) => number;
    };
}


