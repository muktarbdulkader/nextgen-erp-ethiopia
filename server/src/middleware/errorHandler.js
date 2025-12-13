// Global Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    user: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Prisma errors
  if (err.code?.startsWith('P')) {
    return handlePrismaError(err, res);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: err.errors
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

function handlePrismaError(err, res) {
  switch (err.code) {
    case 'P2002':
      return res.status(409).json({
        success: false,
        message: 'A record with this value already exists',
        field: err.meta?.target
      });
    
    case 'P2025':
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    
    case 'P2003':
      return res.status(400).json({
        success: false,
        message: 'Invalid reference to related record'
      });
    
    case 'P2014':
      return res.status(400).json({
        success: false,
        message: 'Invalid relation'
      });
    
    default:
      return res.status(500).json({
        success: false,
        message: 'Database error',
        code: err.code
      });
  }
}

// 404 handler
const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = { errorHandler, notFound };
