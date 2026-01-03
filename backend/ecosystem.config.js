module.exports = {
  apps: [{
    name: 'hrms-backend',
    script: './server.js',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    
    // Environment-specific configurations
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || 5432,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
      EMAIL_HOST: process.env.EMAIL_HOST,
      EMAIL_PORT: process.env.EMAIL_PORT,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD
    },
    
    env_staging: {
      NODE_ENV: 'staging',
      PORT: 5000,
      DB_HOST: process.env.DB_HOST || 'localhost',
      DB_PORT: process.env.DB_PORT || 5432,
      DB_NAME: process.env.DB_NAME,
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRE: process.env.JWT_EXPIRE || '7d'
    },
    
    env_development: {
      NODE_ENV: 'development',
      PORT: 5000,
      watch: true,
      ignore_watch: ['node_modules', 'logs', 'uploads'],
      watch_options: {
        followSymlinks: false
      }
    },
    
    // Logging configuration
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    
    // Advanced features
    min_uptime: '10s',
    max_restarts: 10,
    restart_delay: 4000,
    
    // Monitoring
    instance_var: 'INSTANCE_ID',
    
    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 3000
  }]
};
