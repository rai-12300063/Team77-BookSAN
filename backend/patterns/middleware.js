/**
 * Middleware Pattern - Intercepts requests and responses in a pipeline
 * Use case: Processing learning requests with authentication, validation, logging, etc.
 */

// Base middleware class
class Middleware {
  setNext(middleware) {
    this.nextMiddleware = middleware;
    return middleware;
  }

  handle(request, response, next) {
    if (this.nextMiddleware) {
      return this.nextMiddleware.handle(request, response, next);
    }
    return next ? next(request, response) : response;
  }
}

// Authentication middleware
class AuthenticationMiddleware extends Middleware {
  handle(request, response, next) {
    console.log('🔐 Authentication Middleware: Checking credentials...');
    
    if (!request.headers || !request.headers.authorization) {
      response.status = 401;
      response.error = 'Missing authorization header';
      console.log('❌ Authentication failed: Missing authorization');
      return response;
    }

    // Simulate token validation
    const token = request.headers.authorization.replace('Bearer ', '');
    if (token === 'invalid-token') {
      response.status = 401;
      response.error = 'Invalid token';
      console.log('❌ Authentication failed: Invalid token');
      return response;
    }

    // Add user info to request
    request.user = { id: 1, username: 'john_doe', role: 'student' };
    console.log('✅ Authentication successful');
    
    return super.handle(request, response, next);
  }
}

// Authorization middleware
class AuthorizationMiddleware extends Middleware {
  constructor(requiredRole = null) {
    super();
    this.requiredRole = requiredRole;
  }

  handle(request, response, next) {
    console.log('🛡️  Authorization Middleware: Checking permissions...');
    
    if (!request.user) {
      response.status = 403;
      response.error = 'User not authenticated';
      console.log('❌ Authorization failed: User not authenticated');
      return response;
    }

    if (this.requiredRole && request.user.role !== this.requiredRole) {
      response.status = 403;
      response.error = `Insufficient permissions. Required: ${this.requiredRole}`;
      console.log(`❌ Authorization failed: Required ${this.requiredRole}, got ${request.user.role}`);
      return response;
    }

    console.log('✅ Authorization successful');
    return super.handle(request, response, next);
  }
}

// Validation middleware
class ValidationMiddleware extends Middleware {
  constructor(validationRules) {
    super();
    this.validationRules = validationRules;
  }

  handle(request, response, next) {
    console.log('✏️ Validation Middleware: Validating request data...');
    
    const errors = [];

    for (const rule of this.validationRules) {
      const { field, required, type, minLength, maxLength, pattern } = rule;
      const value = request.body ? request.body[field] : undefined;

      // Check required fields
      if (required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }

      if (value !== undefined && value !== null && value !== '') {
        // Check type
        if (type && typeof value !== type) {
          errors.push(`${field} must be of type ${type}`);
        }

        // Check string length
        if (type === 'string') {
          if (minLength && value.length < minLength) {
            errors.push(`${field} must be at least ${minLength} characters long`);
          }
          if (maxLength && value.length > maxLength) {
            errors.push(`${field} must be no more than ${maxLength} characters long`);
          }
        }

        // Check pattern
        if (pattern && !pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
    }

    if (errors.length > 0) {
      response.status = 400;
      response.error = 'Validation failed';
      response.details = errors;
      console.log('❌ Validation failed:', errors);
      return response;
    }

    console.log('✅ Validation successful');
    return super.handle(request, response, next);
  }
}

// Logging middleware
class LoggingMiddleware extends Middleware {
  handle(request, response, next) {
    const timestamp = new Date().toISOString();
    const method = request.method || 'GET';
    const url = request.url || '/';
    const userId = request.user ? request.user.id : 'anonymous';
    
    console.log(`📝 [${timestamp}] ${method} ${url} - User: ${userId}`);
    
    // Log request body (excluding sensitive data)
    if (request.body) {
      const logBody = { ...request.body };
      delete logBody.password;
      delete logBody.token;
      console.log('📦 Request body:', JSON.stringify(logBody));
    }

    const result = super.handle(request, response, next);
    
    // Log response status
    if (result.status) {
      console.log(`📤 Response status: ${result.status}`);
    }
    
    return result;
  }
}

// Rate limiting middleware
class RateLimitMiddleware extends Middleware {
  constructor(maxRequests = 100, windowMs = 60000) {
    super();
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  handle(request, response, next) {
    console.log('⏱️ Rate Limit Middleware: Checking request rate...');
    
    const clientId = request.user ? request.user.id : request.ip || 'anonymous';
    const now = Date.now();
    
    if (!this.requests.has(clientId)) {
      this.requests.set(clientId, []);
    }
    
    const clientRequests = this.requests.get(clientId);
    
    // Remove old requests outside the window
    const validRequests = clientRequests.filter(time => now - time < this.windowMs);
    this.requests.set(clientId, validRequests);
    
    if (validRequests.length >= this.maxRequests) {
      response.status = 429;
      response.error = 'Too many requests';
      response.retryAfter = Math.ceil(this.windowMs / 1000);
      console.log(`❌ Rate limit exceeded for client: ${clientId}`);
      return response;
    }
    
    // Add current request
    validRequests.push(now);
    console.log(`✅ Rate limit check passed (${validRequests.length}/${this.maxRequests})`);
    
    return super.handle(request, response, next);
  }
}

// Caching middleware
class CachingMiddleware extends Middleware {
  constructor(cacheDurationMs = 300000) {
    super();
    this.cache = new Map();
    this.cacheDuration = cacheDurationMs;
  }

  handle(request, response, next) {
    console.log('💾 Cache Middleware: Checking cache...');
    
    // Only cache GET requests
    if (request.method !== 'GET') {
      return super.handle(request, response, next);
    }

    const cacheKey = `${request.url}_${request.user ? request.user.id : 'anonymous'}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      console.log('✅ Cache hit! Returning cached response');
      return { ...cached.response, cached: true };
    }
    
    console.log('📭 Cache miss, processing request...');
    const result = super.handle(request, response, next);
    
    // Cache successful responses
    if (!result.error && result.status !== 429) {
      this.cache.set(cacheKey, {
        response: { ...result },
        timestamp: Date.now()
      });
      console.log('💾 Response cached');
    }
    
    return result;
  }
}

// Middleware pipeline manager
class MiddlewarePipeline {
  constructor() {
    this.firstMiddleware = null;
    this.lastMiddleware = null;
  }

  use(middleware) {
    if (!this.firstMiddleware) {
      this.firstMiddleware = middleware;
      this.lastMiddleware = middleware;
    } else {
      this.lastMiddleware.setNext(middleware);
      this.lastMiddleware = middleware;
    }
    return this;
  }

  execute(request, finalHandler) {
    const response = { status: 200, data: null, cached: false };
    
    if (!this.firstMiddleware) {
      return finalHandler ? finalHandler(request, response) : response;
    }
    
    return this.firstMiddleware.handle(request, response, finalHandler);
  }
}

// Usage example
function demonstrateMiddleware() {
  console.log('=== Middleware Pattern Demo ===\n');

  // Create middleware pipeline
  const pipeline = new MiddlewarePipeline()
    .use(new LoggingMiddleware())
    .use(new AuthenticationMiddleware())
    .use(new AuthorizationMiddleware('student'))
    .use(new ValidationMiddleware([
      { field: 'courseId', required: true, type: 'string', minLength: 1 },
      { field: 'progress', required: true, type: 'number' }
    ]))
    .use(new RateLimitMiddleware(5, 60000)) // 5 requests per minute
    .use(new CachingMiddleware(30000)); // 30 second cache

  // Final handler (simulates the actual business logic)
  const updateProgressHandler = (request, response) => {
    console.log('🎯 Final Handler: Processing update progress request...');
    response.data = {
      message: 'Progress updated successfully',
      courseId: request.body.courseId,
      progress: request.body.progress,
      userId: request.user.id
    };
    console.log('✅ Progress updated successfully');
    return response;
  };

  // Test scenarios
  console.log('1. Valid request:');
  const validRequest = {
    method: 'POST',
    url: '/api/progress/update',
    headers: { authorization: 'Bearer valid-token' },
    body: { courseId: 'course-123', progress: 75 }
  };
  
  let result = pipeline.execute(validRequest, updateProgressHandler);
  console.log('Result:', { status: result.status, data: result.data, error: result.error });

  console.log('\n2. Invalid authentication:');
  const invalidAuthRequest = {
    method: 'POST',
    url: '/api/progress/update',
    headers: { authorization: 'Bearer invalid-token' },
    body: { courseId: 'course-123', progress: 75 }
  };
  
  result = pipeline.execute(invalidAuthRequest, updateProgressHandler);
  console.log('Result:', { status: result.status, error: result.error });

  console.log('\n3. Missing required field:');
  const invalidDataRequest = {
    method: 'POST',
    url: '/api/progress/update',
    headers: { authorization: 'Bearer valid-token' },
    body: { progress: 75 } // missing courseId
  };
  
  result = pipeline.execute(invalidDataRequest, updateProgressHandler);
  console.log('Result:', { status: result.status, error: result.error, details: result.details });

  console.log('\n4. Second request (should be cached for GET):');
  const cachedRequest = {
    method: 'GET',
    url: '/api/courses/123',
    headers: { authorization: 'Bearer valid-token' },
    body: { courseId: 'course-123', progress: 75 }
  };
  
  // First request
  pipeline.execute(cachedRequest, (req, res) => {
    res.data = { courseId: '123', title: 'JavaScript Basics' };
    return res;
  });
  
  // Second request (should be cached)
  result = pipeline.execute(cachedRequest, (req, res) => {
    res.data = { courseId: '123', title: 'JavaScript Basics' };
    return res;
  });
  console.log('Cached result:', { cached: result.cached, data: result.data });
}

module.exports = {
  Middleware,
  AuthenticationMiddleware,
  AuthorizationMiddleware,
  ValidationMiddleware,
  LoggingMiddleware,
  RateLimitMiddleware,
  CachingMiddleware,
  MiddlewarePipeline,
  demonstrateMiddleware
};