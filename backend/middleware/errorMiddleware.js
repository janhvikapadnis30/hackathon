/**
 * Centralized Error Handling Middleware
 */

function errorHandler(err, req, res, next) {
  // Log internal error for debugging
  console.error(`[Error] ${req.method} ${req.url}:`, err.message || err);

  // PostgreSQL Error Handling
  if (err.code === '23505') {
    // Unique violation
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry: A record with these unique details already exists.',
      detail: err.detail || null,
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      message: 'Referenced entity does not exist or cannot be modified.',
      detail: err.detail || null,
    });
  }

  if (err.code === '23514') {
    // Check constraint violation
    return res.status(400).json({
      success: false,
      message: 'Validation failed: The provided values violate database integrity constraints.',
    });
  }

  // Syntax or bad JSON body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload provided.',
    });
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  return res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
