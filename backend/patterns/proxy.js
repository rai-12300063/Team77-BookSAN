/**
 * Proxy Pattern - Controls access to another object
 * Use case: Access control, caching, lazy loading, and monitoring for learning resources
 */

// Subject interface
class LearningResource {
  getContent() {
    throw new Error('getContent() method must be implemented');
  }

  getMetadata() {
    throw new Error('getMetadata() method must be implemented');
  }
}

// Real subject - Actual learning resource
class RealLearningResource extends LearningResource {
  constructor(id, title, content, size, premium = false) {
    super();
    this.id = id;
    this.title = title;
    this.content = content;
    this.size = size; // in MB
    this.premium = premium;
    this.loadTime = Math.random() * 2000 + 1000; // Simulate load time
  }

  getContent() {
    // Simulate expensive operation
    console.log(`📂 Loading content "${this.title}"... (${this.size}MB)`);
    return new Promise(resolve => {
      setTimeout(() => {
        console.log(`✅ Content loaded: "${this.title}"`);
        resolve(this.content);
      }, this.loadTime);
    });
  }

  getMetadata() {
    return {
      id: this.id,
      title: this.title,
      size: this.size,
      premium: this.premium,
      type: 'learning-resource'
    };
  }
}

// Access Control Proxy
class AccessControlProxy extends LearningResource {
  constructor(realResource, userRole, userSubscription) {
    super();
    this.realResource = realResource;
    this.userRole = userRole;
    this.userSubscription = userSubscription;
  }

  async getContent() {
    // Check access permissions
    if (!this.hasAccess()) {
      throw new Error(`Access denied: ${this.getAccessDeniedReason()}`);
    }

    console.log(`🔐 Access granted for user role: ${this.userRole}`);
    return await this.realResource.getContent();
  }

  getMetadata() {
    return {
      ...this.realResource.getMetadata(),
      accessible: this.hasAccess(),
      accessReason: this.hasAccess() ? 'Authorized' : this.getAccessDeniedReason()
    };
  }

  hasAccess() {
    // Premium content requires premium subscription
    if (this.realResource.premium) {
      return this.userSubscription === 'premium' || this.userRole === 'admin';
    }
    
    // Regular content accessible to all authenticated users
    return this.userRole !== 'guest';
  }

  getAccessDeniedReason() {
    if (this.userRole === 'guest') {
      return 'Authentication required';
    }
    if (this.realResource.premium && this.userSubscription !== 'premium') {
      return 'Premium subscription required';
    }
    return 'Unknown access restriction';
  }
}

// Caching Proxy
class CachingProxy extends LearningResource {
  constructor(realResource, cacheTimeout = 300000) { // 5 minutes default
    super();
    this.realResource = realResource;
    this.cache = new Map();
    this.cacheTimeout = cacheTimeout;
  }

  async getContent() {
    const cacheKey = `content_${this.realResource.id}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      console.log(`💾 Cache hit! Returning cached content for "${this.realResource.title}"`);
      return cached.content;
    }

    console.log(`📭 Cache miss, loading content for "${this.realResource.title}"`);
    const content = await this.realResource.getContent();
    
    // Cache the content
    this.cache.set(cacheKey, {
      content,
      timestamp: Date.now()
    });
    
    console.log(`💾 Content cached for "${this.realResource.title}"`);
    return content;
  }

  getMetadata() {
    return {
      ...this.realResource.getMetadata(),
      cached: this.isCached()
    };
  }

  isCached() {
    const cacheKey = `content_${this.realResource.id}`;
    const cached = this.cache.get(cacheKey);
    return cached && Date.now() - cached.timestamp < this.cacheTimeout;
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }
}

// Lazy Loading Proxy
class LazyLoadingProxy extends LearningResource {
  constructor(resourceConfig) {
    super();
    this.resourceConfig = resourceConfig;
    this.realResource = null;
  }

  async getContent() {
    if (!this.realResource) {
      console.log(`⏳ Lazy loading resource: ${this.resourceConfig.title}`);
      this.realResource = new RealLearningResource(
        this.resourceConfig.id,
        this.resourceConfig.title,
        this.resourceConfig.content,
        this.resourceConfig.size,
        this.resourceConfig.premium
      );
    }

    return await this.realResource.getContent();
  }

  getMetadata() {
    return {
      id: this.resourceConfig.id,
      title: this.resourceConfig.title,
      size: this.resourceConfig.size,
      premium: this.resourceConfig.premium,
      type: 'lazy-loaded-resource',
      loaded: this.realResource !== null
    };
  }
}

// Monitoring Proxy
class MonitoringProxy extends LearningResource {
  constructor(realResource) {
    super();
    this.realResource = realResource;
    this.accessCount = 0;
    this.lastAccessed = null;
    this.totalLoadTime = 0;
  }

  async getContent() {
    const startTime = Date.now();
    this.accessCount++;
    this.lastAccessed = new Date();
    
    console.log(`📊 Monitoring: Access #${this.accessCount} to "${this.realResource.title}"`);
    
    const content = await this.realResource.getContent();
    
    const loadTime = Date.now() - startTime;
    this.totalLoadTime += loadTime;
    
    console.log(`📊 Monitoring: Load completed in ${loadTime}ms (avg: ${(this.totalLoadTime / this.accessCount).toFixed(0)}ms)`);
    
    return content;
  }

  getMetadata() {
    return {
      ...this.realResource.getMetadata(),
      monitoring: {
        accessCount: this.accessCount,
        lastAccessed: this.lastAccessed,
        averageLoadTime: this.accessCount > 0 ? (this.totalLoadTime / this.accessCount).toFixed(0) : 0
      }
    };
  }

  getStatistics() {
    return {
      resourceId: this.realResource.id,
      title: this.realResource.title,
      accessCount: this.accessCount,
      lastAccessed: this.lastAccessed,
      totalLoadTime: this.totalLoadTime,
      averageLoadTime: this.accessCount > 0 ? (this.totalLoadTime / this.accessCount).toFixed(0) : 0
    };
  }
}

// Composite Proxy - Combines multiple proxy behaviors
class CompositeProxy extends LearningResource {
  constructor(realResource, userRole, userSubscription) {
    super();
    
    // Chain proxies: Monitoring -> Caching -> Access Control -> Real Resource
    this.monitoringProxy = new MonitoringProxy(
      new CachingProxy(
        new AccessControlProxy(realResource, userRole, userSubscription),
        300000 // 5 minutes cache
      )
    );
  }

  async getContent() {
    return await this.monitoringProxy.getContent();
  }

  getMetadata() {
    return this.monitoringProxy.getMetadata();
  }

  getStatistics() {
    return this.monitoringProxy.getStatistics();
  }
}

// Resource Manager using proxies
class LearningResourceManager {
  constructor() {
    this.resources = new Map();
  }

  addResource(id, title, content, size, premium = false) {
    const resource = new RealLearningResource(id, title, content, size, premium);
    this.resources.set(id, resource);
    console.log(`📚 Added resource: ${title}`);
  }

  getResource(id, userRole = 'guest', userSubscription = 'free') {
    const resource = this.resources.get(id);
    if (!resource) {
      throw new Error(`Resource not found: ${id}`);
    }

    // Return a composite proxy that handles all concerns
    return new CompositeProxy(resource, userRole, userSubscription);
  }

  createLazyResource(config) {
    return new LazyLoadingProxy(config);
  }

  listResources() {
    return Array.from(this.resources.keys());
  }
}

// Usage example
async function demonstrateProxy() {
  console.log('=== Proxy Pattern Demo ===\n');

  // Create resource manager
  const resourceManager = new LearningResourceManager();

  // Add some resources
  resourceManager.addResource(
    'js-basics',
    'JavaScript Basics',
    'Complete JavaScript tutorial content...',
    15,
    false
  );

  resourceManager.addResource(
    'advanced-react',
    'Advanced React Patterns',
    'Advanced React patterns and techniques...',
    25,
    true // Premium content
  );

  console.log('\n1. Access control demo:');
  
  // Guest user trying to access free content
  try {
    const freeResource = resourceManager.getResource('js-basics', 'guest', 'free');
    console.log('Guest metadata:', freeResource.getMetadata());
    await freeResource.getContent();
  } catch (error) {
    console.log('❌ Guest access error:', error.message);
  }

  // Regular user accessing free content
  const regularUserResource = resourceManager.getResource('js-basics', 'student', 'free');
  console.log('\nRegular user metadata:', regularUserResource.getMetadata());
  await regularUserResource.getContent();

  console.log('\n2. Premium content access:');
  
  // Regular user trying to access premium content
  try {
    const premiumResource = resourceManager.getResource('advanced-react', 'student', 'free');
    await premiumResource.getContent();
  } catch (error) {
    console.log('❌ Premium access error:', error.message);
  }

  // Premium user accessing premium content
  const premiumUserResource = resourceManager.getResource('advanced-react', 'student', 'premium');
  await premiumUserResource.getContent();

  console.log('\n3. Caching demo:');
  
  // Multiple accesses to demonstrate caching
  console.log('First access:');
  await regularUserResource.getContent();
  
  console.log('\nSecond access (should be cached):');
  await regularUserResource.getContent();

  console.log('\n4. Monitoring statistics:');
  console.log('Resource statistics:', regularUserResource.getStatistics());

  console.log('\n5. Lazy loading demo:');
  
  const lazyResource = resourceManager.createLazyResource({
    id: 'python-advanced',
    title: 'Advanced Python Programming',
    content: 'Advanced Python concepts and patterns...',
    size: 30,
    premium: true
  });

  console.log('Lazy resource metadata (before loading):', lazyResource.getMetadata());
  await lazyResource.getContent();
  console.log('Lazy resource metadata (after loading):', lazyResource.getMetadata());

  console.log('\n6. Individual proxy demos:');
  
  // Direct proxy usage
  const realResource = new RealLearningResource(
    'test-resource',
    'Test Resource',
    'Test content',
    5,
    false
  );

  // Access control proxy
  const accessProxy = new AccessControlProxy(realResource, 'admin', 'premium');
  console.log('\nAccess proxy metadata:', accessProxy.getMetadata());

  // Caching proxy
  const cachingProxy = new CachingProxy(realResource);
  console.log('Cache proxy metadata (before):', cachingProxy.getMetadata());
  await cachingProxy.getContent();
  console.log('Cache proxy metadata (after):', cachingProxy.getMetadata());

  // Monitoring proxy
  const monitoringProxy = new MonitoringProxy(realResource);
  await monitoringProxy.getContent();
  console.log('Monitoring statistics:', monitoringProxy.getStatistics());
}

module.exports = {
  LearningResource,
  RealLearningResource,
  AccessControlProxy,
  CachingProxy,
  LazyLoadingProxy,
  MonitoringProxy,
  CompositeProxy,
  LearningResourceManager,
  demonstrateProxy
};