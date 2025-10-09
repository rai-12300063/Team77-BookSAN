// Performance optimization configuration
module.exports = {
  // Database connection optimizations
  database: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferMaxEntries: 0,
    bufferCommands: false,
  },
  
  // API response optimizations
  api: {
    // Enable gzip compression
    compression: true,
    // Cache control headers
    cacheControl: {
      static: '1y',
      api: '5m'
    },
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },
  
  // Frontend optimizations
  frontend: {
    // Lazy loading chunks
    lazyLoading: true,
    // Code splitting
    codeSplitting: true,
    // Bundle optimization
    bundleOptimization: {
      minify: true,
      treeshaking: true,
      deadCodeElimination: true
    }
  }
};