import axios, { AxiosRequestConfig } from 'axios';
import { HttpResponse, TestCase } from '../types';
import { handleSuccessResponse, handleErrorResponse } from '../utils/response';
import { ValidationError } from '../utils/errors';
import { requestSpinner } from '../utils/ui';
import { NetworkError } from '../utils/errors';

export async function executeRequest(test: TestCase, baseUrl: string, testTimeout: number): Promise<HttpResponse> {
  const startTime = Date.now();

  if (!test.request.method || !test.request.url) {
    throw new ValidationError('Request method and URL are required');
  }

  // Prepare request config
  const config: AxiosRequestConfig = {
    method: test.request.method,
    url: `${baseUrl}${test.request.url}`,
    headers: test.request.header,
    data: test.request.body,
    timeout: testTimeout, // Default timeout
    validateStatus: (status) => status >= 200 && status < 600, // Accept all status codes
  };

  try {
    // Log request details
    requestSpinner.start(`🚀 Executing ${test.name}`);
    requestSpinner.text = `${config.method} ${config.url}`;
    if (config.headers) {
      console.log('Headers:', config.headers);
    }
    if (config.data) {
      console.log('Body:', config.data);
    }
    // Execute request
    const response = await axios(config);

    // Calculate duration
    const duration = Date.now() - startTime;

    // Stop spinner with success
    requestSpinner.succeed(`Completed ${test.name} in ${duration}ms`);

    // Log response details
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));

    // Return unified response format
    return handleSuccessResponse(response, startTime);
  } catch (error) {
    requestSpinner.fail(`Failed ${test.name}`);
    return handleErrorResponse(error, startTime);
  }
}
