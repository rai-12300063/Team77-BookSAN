// Performance monitoring middleware
const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Log slow requests
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log requests taking more than 1 second
      console.log(`🐌 Slow request: ${req.method} ${req.path} - ${duration}ms`);
    }
  });
  
  next();
};

module.exports = performanceMiddleware;