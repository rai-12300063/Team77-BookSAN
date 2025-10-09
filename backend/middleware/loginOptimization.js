// Login optimization middleware
const loginOptimization = (req, res, next) => {
  // Set response headers for faster processing
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'X-Content-Type-Options': 'nosniff'
  });
  
  // Add request timing
  req.startTime = Date.now();
  
  // Override res.json to add timing info
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - req.startTime;
    if (duration > 2000) { // Log slow login attempts
      console.log(`🐌 Slow login: ${duration}ms for ${req.body?.email}`);
    }
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = loginOptimization;