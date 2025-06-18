// src/types/http.ts

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | string;

export interface FormData {
  key: string;
  values?: string[];
  paths?: string[];
}

export interface HttpRequest {
  method: Method;
  protoMajor: number;  // e.g. 1
  protoMinor: number;  // e.g. 0
  url: string;
  urlParams?: Record<string, string>;
  header: Record<string, string>;
  body: string;
  binary?: string;
  form?: FormData[];
  timestamp: Date;
}

export interface HttpResponse {
  statusCode: number;  // e.g. 200
  header: Record<string, string>;
  body: string;
  statusMessage: string;
  protoMajor: number;
  protoMinor: number;
  binary?: string;
  timestamp: Date;
}

export interface OutputBinary {
  // Add properties based on your needs
  [key: string]: unknown;
}

export type AssertionType = string;  // Define specific assertion types if needed

export interface HTTPSchema {
  metadata: Record<string, string>;
  req: HttpRequest;
  resp: HttpResponse;
  objects?: OutputBinary[];
  assertions?: Record<AssertionType, unknown>;
  created?: number;
  reqTimestampMock?: Date;
  resTimestampMock?: Date;
}