// Request Logger Middleware
const logger = (req, res, next) => {
  const start = Date.now();
  
  // Log request
  console.log(`→ ${req.method} ${req.path}`, {
    ip: req.ip,
    user: req.user?.id,
    company: req.user?.companyName,
    timestamp: new Date().toISOString()
  });

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`← ${logLevel} ${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
  });

  next();
};

module.exports = logger;
