export class ApiError extends Error {
  statusCode: number;
  code?: string;
  details?: any;

  constructor(message: string, statusCode = 500, code?: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function normalizeError(error: any): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error?.response?.data?.message) {
    return new ApiError(
      error.response.data.message,
      error.response.status || 500,
      error.response.data.code,
      error.response.data.details
    );
  }
  if (error?.message) {
    return new ApiError(error.message, 500);
  }
  return new ApiError('An unexpected server error occurred', 500);
}
