import { ValidationError } from '../types';

export class AppError extends Error {
  public statusCode?: number;
  public details?: ValidationError[];

  constructor(message: string, statusCode?: number, details?: ValidationError[]) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const handleApiError = (error: any): AppError => {
  // Network errors
  if (!error.response) {
    return new AppError('Network error. Please check your connection.');
  }

  const { status, data } = error.response;
  
  // Server returned error structure
  if (data?.error) {
    return new AppError(
      data.error.message || 'An error occurred',
      status,
      data.error.details
    );
  }

  // Legacy error format
  if (data?.error && typeof data.error === 'string') {
    return new AppError(data.error, status);
  }

  // Generic status-based errors
  switch (status) {
    case 400:
      return new AppError('Invalid request data');
    case 401:
      return new AppError('Please log in to continue');
    case 403:
      return new AppError('You do not have permission to perform this action');
    case 404:
      return new AppError('Resource not found');
    case 409:
      return new AppError('Resource already exists');
    case 429:
      return new AppError('Too many requests. Please try again later.');
    case 500:
      return new AppError('Server error. Please try again later.');
    default:
      return new AppError('An unexpected error occurred');
  }
};

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

export const formatValidationErrors = (errors: ValidationError[]): string => {
  return errors.map(error => `${error.field}: ${error.message}`).join(', ');
};