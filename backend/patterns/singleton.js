/**
 * Singleton Pattern - Ensures a class has only one instance
 * Use case: Configuration manager, database connection, logging service
 */

// Basic Singleton implementation
class DatabaseConnection {
  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }

    this.connectionString = null;
    this.isConnected = false;
    this.connectionPool = [];
    this.connectionCount = 0;
    
    DatabaseConnection.instance = this;
    return this;
  }

  connect(connectionString) {
    if (this.isConnected) {
      console.log('📡 Already connected to database');
      return this;
    }

    this.connectionString = connectionString;
    this.isConnected = true;
    this.connectionCount++;
    
    console.log(`🔌 Connected to database: ${connectionString}`);
    console.log(`📊 Total connections made: ${this.connectionCount}`);
    
    return this;
  }

  disconnect() {
    if (!this.isConnected) {
      console.log('📡 Already disconnected from database');
      return this;
    }

    this.isConnected = false;
    console.log('🔌 Disconnected from database');
    return this;
  }

  query(sql) {
    if (!this.isConnected) {
      throw new Error('Database not connected');
    }
    
    console.log(`🔍 Executing query: ${sql}`);
    return { result: 'query result', timestamp: new Date() };
  }

  getStatus() {
    return {
      connected: this.isConnected,
      connectionString: this.connectionString,
      totalConnections: this.connectionCount
    };
  }

  // Static method to get instance
  static getInstance() {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }
}

// Configuration Manager Singleton
class ConfigurationManager {
  constructor() {
    if (ConfigurationManager.instance) {
      return ConfigurationManager.instance;
    }

    this.config = new Map();
    this.loadDefaultConfig();
    
    ConfigurationManager.instance = this;
    return this;
  }

  loadDefaultConfig() {
    this.config.set('app.name', 'Learning Progress Tracker');
    this.config.set('app.version', '1.0.0');
    this.config.set('database.host', 'localhost');
    this.config.set('database.port', 27017);
    this.config.set('cache.ttl', 300000);
    this.config.set('auth.secret', 'default-secret');
    this.config.set('features.analytics', true);
    this.config.set('features.notifications', true);
  }

  get(key) {
    return this.config.get(key);
  }

  set(key, value) {
    const oldValue = this.config.get(key);
    this.config.set(key, value);
    console.log(`⚙️ Config updated: ${key} = ${value} (was: ${oldValue})`);
    return this;
  }

  has(key) {
    return this.config.has(key);
  }

  getAll() {
    return Object.fromEntries(this.config);
  }

  reset() {
    this.config.clear();
    this.loadDefaultConfig();
    console.log('🔄 Configuration reset to defaults');
    return this;
  }

  static getInstance() {
    if (!ConfigurationManager.instance) {
      ConfigurationManager.instance = new ConfigurationManager();
    }
    return ConfigurationManager.instance;
  }
}

// Logger Singleton
class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    this.logs = [];
    this.level = 'INFO';
    this.maxLogs = 1000;
    
    Logger.instance = this;
    return this;
  }

  setLevel(level) {
    this.level = level;
    console.log(`📝 Logger level set to: ${level}`);
    return this;
  }

  log(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console output with colors
    const colors = {
      ERROR: '\x1b[31m',   // Red
      WARN: '\x1b[33m',    // Yellow
      INFO: '\x1b[32m',    // Green
      DEBUG: '\x1b[36m',   // Cyan
      RESET: '\x1b[0m'     // Reset
    };

    const color = colors[level] || colors.INFO;
    console.log(`${color}[${logEntry.timestamp}] ${level}: ${message}${colors.RESET}`);
    
    if (data) {
      console.log(`${color}Data:${colors.RESET}`, data);
    }

    return this;
  }

  error(message, data = null) {
    return this.log('ERROR', message, data);
  }

  warn(message, data = null) {
    return this.log('WARN', message, data);
  }

  info(message, data = null) {
    return this.log('INFO', message, data);
  }

  debug(message, data = null) {
    return this.log('DEBUG', message, data);
  }

  getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
    console.log('🗑️ Logs cleared');
    return this;
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}

// Application State Manager Singleton
class ApplicationStateManager {
  constructor() {
    if (ApplicationStateManager.instance) {
      return ApplicationStateManager.instance;
    }

    this.state = {
      currentUser: null,
      activeConnections: 0,
      systemStatus: 'idle',
      features: new Set(),
      cache: new Map()
    };
    
    this.subscribers = [];
    
    ApplicationStateManager.instance = this;
    return this;
  }

  setState(updates) {
    const oldState = { ...this.state };
    this.state = { ...this.state, ...updates };
    
    // Notify subscribers
    this.notifySubscribers(oldState, this.state);
    
    return this;
  }

  getState() {
    return { ...this.state };
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notifySubscribers(oldState, newState) {
    this.subscribers.forEach(callback => {
      try {
        callback(newState, oldState);
      } catch (error) {
        console.error('Error in state subscriber:', error);
      }
    });
  }

  // User management
  setCurrentUser(user) {
    return this.setState({ currentUser: user });
  }

  getCurrentUser() {
    return this.state.currentUser;
  }

  // Connection management
  incrementConnections() {
    return this.setState({ activeConnections: this.state.activeConnections + 1 });
  }

  decrementConnections() {
    return this.setState({ 
      activeConnections: Math.max(0, this.state.activeConnections - 1) 
    });
  }

  // Feature management
  enableFeature(feature) {
    const features = new Set(this.state.features);
    features.add(feature);
    return this.setState({ features });
  }

  disableFeature(feature) {
    const features = new Set(this.state.features);
    features.delete(feature);
    return this.setState({ features });
  }

  isFeatureEnabled(feature) {
    return this.state.features.has(feature);
  }

  // Cache management
  setCache(key, value) {
    const cache = new Map(this.state.cache);
    cache.set(key, value);
    return this.setState({ cache });
  }

  getCache(key) {
    return this.state.cache.get(key);
  }

  static getInstance() {
    if (!ApplicationStateManager.instance) {
      ApplicationStateManager.instance = new ApplicationStateManager();
    }
    return ApplicationStateManager.instance;
  }
}

// Thread-safe Singleton using closure (advanced)
const createSingleton = (function() {
  let instances = new Map();
  
  return function(className, ...args) {
    if (!instances.has(className)) {
      instances.set(className, new className(...args));
    }
    return instances.get(className);
  };
})();

// Enum-based Singleton (for simple state management)
const SystemStatus = Object.freeze({
  INITIALIZING: 'initializing',
  RUNNING: 'running',
  MAINTENANCE: 'maintenance',
  ERROR: 'error',
  SHUTDOWN: 'shutdown'
});

// Usage example
function demonstrateSingleton() {
  console.log('=== Singleton Pattern Demo ===\n');

  console.log('1. Database Connection Singleton:');
  
  // Multiple attempts to create database connections
  const db1 = new DatabaseConnection();
  const db2 = new DatabaseConnection();
  const db3 = DatabaseConnection.getInstance();
  
  console.log('Same instance?', db1 === db2 && db2 === db3);
  
  db1.connect('mongodb://localhost:27017/learning_tracker');
  console.log('DB1 Status:', db1.getStatus());
  console.log('DB2 Status:', db2.getStatus()); // Same instance, same status
  
  console.log('\n2. Configuration Manager:');
  
  const config1 = new ConfigurationManager();
  const config2 = ConfigurationManager.getInstance();
  
  console.log('Same config instance?', config1 === config2);
  
  config1.set('app.theme', 'dark');
  console.log('Config from instance 2:', config2.get('app.theme'));
  
  console.log('All config:', config1.getAll());

  console.log('\n3. Logger Singleton:');
  
  const logger1 = new Logger();
  const logger2 = Logger.getInstance();
  
  console.log('Same logger instance?', logger1 === logger2);
  
  logger1.info('Application started');
  logger2.warn('This is a warning message');
  logger1.error('An error occurred', { code: 500, details: 'Server error' });
  
  console.log('Recent logs:', logger2.getLogs(null, 3));

  console.log('\n4. Application State Manager:');
  
  const stateManager1 = new ApplicationStateManager();
  const stateManager2 = ApplicationStateManager.getInstance();
  
  console.log('Same state manager?', stateManager1 === stateManager2);
  
  // Subscribe to state changes
  const unsubscribe = stateManager1.subscribe((newState, oldState) => {
    console.log('📢 State changed:', {
      activeConnections: `${oldState.activeConnections} -> ${newState.activeConnections}`,
      systemStatus: `${oldState.systemStatus} -> ${newState.systemStatus}`
    });
  });
  
  stateManager1.setCurrentUser({ id: 1, name: 'John Doe' });
  stateManager1.incrementConnections();
  stateManager1.setState({ systemStatus: SystemStatus.RUNNING });
  stateManager1.enableFeature('analytics');
  
  console.log('Current state:', stateManager2.getState());
  console.log('Analytics enabled?', stateManager2.isFeatureEnabled('analytics'));
  
  // Cleanup
  unsubscribe();

  console.log('\n5. Advanced Singleton with closure:');
  
  // Using the closure-based singleton factory
  class CustomService {
    constructor(name) {
      this.name = name;
      this.id = Math.random().toString(36).substr(2, 9);
    }
    
    getName() {
      return this.name;
    }
    
    getId() {
      return this.id;
    }
  }
  
  const service1 = createSingleton(CustomService, 'MyService');
  const service2 = createSingleton(CustomService, 'AnotherName'); // Will ignore the name
  
  console.log('Same service instance?', service1 === service2);
  console.log('Service name:', service1.getName());
  console.log('Service ID:', service1.getId());

  console.log('\n6. Real-world usage scenario:');
  
  // Simulate a real application workflow
  const logger = Logger.getInstance();
  const config = ConfigurationManager.getInstance();
  const db = DatabaseConnection.getInstance();
  const appState = ApplicationStateManager.getInstance();
  
  logger.info('Application initialization started');
  
  // Configure application
  config.set('database.url', 'mongodb://prod-server:27017/learning_db');
  config.set('features.realtime', true);
  
  // Connect to database
  db.connect(config.get('database.url'));
  
  // Update application state
  appState.setState({ systemStatus: SystemStatus.RUNNING });
  appState.enableFeature('realtime');
  
  // Simulate user activity
  appState.setCurrentUser({ id: 123, name: 'Alice Johnson' });
  appState.incrementConnections();
  
  logger.info('User logged in', appState.getCurrentUser());
  logger.info('System ready', { 
    status: appState.getState().systemStatus,
    connections: appState.getState().activeConnections,
    features: Array.from(appState.getState().features)
  });
  
  // All singletons maintain their state across the application
  console.log('Final system state:', {
    database: db.getStatus(),
    logging: `${logger.getLogs().length} log entries`,
    config: Object.keys(config.getAll()).length + ' config keys',
    appState: appState.getState()
  });
}

module.exports = {
  DatabaseConnection,
  ConfigurationManager,
  Logger,
  ApplicationStateManager,
  createSingleton,
  SystemStatus,
  demonstrateSingleton
};