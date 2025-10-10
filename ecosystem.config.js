// PM2 Process Configuration for BookSAN Learning Progress Tracker
module.exports = {
  apps: [
    {
      name: 'booksan-backend',
      script: './backend/server.js',
      cwd: process.cwd(), // Use current directory (auto-detects deployment path)
      instances: 1,
      exec_mode: 'fork',
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
      min_uptime: '10s'
    }
  ]
};