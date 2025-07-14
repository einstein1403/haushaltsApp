// Custom error classes
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401);
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging (but not sensitive info)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  } else {
    // In production, log only non-sensitive information
    console.error('Error:', {
      name: err.name,
      message: err.message,
      statusCode: err.statusCode,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      ip: req.ip
    });
  }

  // Mongoose/PostgreSQL duplicate key error
  if (err.code === '23505') {
    const message = 'Resource already exists';
    error = new ConflictError(message);
  }

  // Mongoose/PostgreSQL validation error
  if (err.code === '23502') {
    const message = 'Required field missing';
    error = new ValidationError(message);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = new AuthenticationError(message);
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = new AuthenticationError(message);
  }

  // Joi validation errors (handled by validation middleware, but just in case)
  if (err.name === 'ValidationError' && err.details) {
    const message = 'Invalid input data';
    error = new ValidationError(message);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: {
      message: error.isOperational ? error.message : 'Something went wrong',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  errorHandler,
  asyncHandler,
  notFound
};