/**
 * Performance Monitoring Middleware
 * Tracks request timing and identifies slow operations
 */

const performanceMonitor = (req, res, next) => {
    const startTime = Date.now();
    const startHrTime = process.hrtime();
    
    // Store original end function
    const originalEnd = res.end;
    
    // Override end to measure response time
    res.end = function(...args) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const hrDuration = process.hrtime(startHrTime);
        const durationMs = hrDuration[0] * 1000 + hrDuration[1] / 1000000;
        
        // Log slow requests (>1000ms)
        if (duration > 1000) {
            console.warn(`⚠️ SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`);
        } else if (duration > 500) {
            console.log(`🐌 MEDIUM REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`);
        } else if (req.originalUrl.includes('/auth/login')) {
            // Always log login performance
            console.log(`🔐 LOGIN: ${req.method} ${req.originalUrl} took ${duration}ms`);
        }
        
        // Add response headers for debugging
        res.set('X-Response-Time', `${duration}ms`);
        res.set('X-Response-Time-Precise', `${durationMs.toFixed(2)}ms`);
        
        // Call original end function
        originalEnd.apply(this, args);
    };
    
    next();
};

module.exports = performanceMonitor;