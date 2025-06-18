import { AxiosResponse, AxiosError } from 'axios';
import { HttpResponse } from '../types';
import { 
  HTTPError, 
  NetworkError, 
  TimeoutError, 
  RequestError 
} from './errors';

export function handleSuccessResponse(
  response: AxiosResponse,
  startTime: number
): HttpResponse {
  const duration = Date.now() - startTime;
  
  return {
    statusCode: response.status,
    statusText: response.statusText,
    statusMessage: response.statusText,
    headers: response.headers as Record<string, string>,
    body: response.data,
    timestamp: new Date(),
    protoMajor: 1,
    protoMinor: 1,
    duration
  };
}

export function handleErrorResponse(
  error: unknown,
  startTime: number
): HttpResponse {
  const duration = Date.now() - startTime;

  if (error instanceof AxiosError) {
    if (error.code === 'ECONNABORTED') {
      throw new TimeoutError(5000); // Default timeout
    }

    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new NetworkError(`Network error: ${error.message}`);
    }

    if (error.response) {
      // Server responded with error status
      throw new HTTPError(
        error.response.status,
        error.response.statusText,
        error.response.data
      );
    }

    if (error.request) {
      // Request was made but no response received
      throw new NetworkError('No response received from server');
    }
  }

  // Handle unknown errors
  throw new RequestError(
    'An unexpected error occurred',
    error
  );
}