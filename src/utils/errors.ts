export class APIFlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'APIFlowError';
  }
}

export class NetworkError extends APIFlowError {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends APIFlowError {
  constructor(timeout: number) {
    super(`Request timed out after ${timeout}ms`);
    this.name = 'TimeoutError';
  }
}

export class ValidationError extends APIFlowError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class HTTPError extends APIFlowError {
  constructor(
    public statusCode: number,
    public statusText: string,
    public response?: unknown
  ) {
    super(`HTTP Error ${statusCode}: ${statusText}`);
    this.name = 'HTTPError';
  }
}

export class RequestError extends APIFlowError {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'RequestError';
  }
}
