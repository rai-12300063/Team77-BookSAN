// PM2 Process Configuration for BookSAN Learning Progress Tracker
module.exports = {
  apps: [
    {
      name: 'booksan-backend',
      script: './backend/server.js',
      cwd: process.cwd(), // Use current directory (auto-detects deployment path)
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      env: {
        NODE_ENV: 'development',
        PORT: 5001
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Health check configuration
      health_check_grace_period: 10000,
      // Environment variables for error handling
      node_args: '--max-old-space-size=1024'
    }
  ],
  
  // Deployment configuration
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'localhost',
      ref: 'origin/BOOKSAN-150-development-final',
      repo: 'https://github.com/rai-12300063/Team77-BookSAN.git',
      path: '/home/ubuntu/booksan-deployment',
      'post-deploy': 'cd backend && npm ci && cd ../frontend && npm ci && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};