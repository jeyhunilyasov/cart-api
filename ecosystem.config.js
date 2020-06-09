module.exports = {
  apps: [
    {
      name: 'lp-api',
      script: './index.js',
      cwd: './',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      autorestart: true,
      max_memory_restart: '300M',
      log_date_format: 'DD-MM-YYYY hh:mm:ss A',
      out_file: './storage/logs/info.log',
      error_file: './storage/logs/error.log',
      combine_logs: true,
      min_uptime: 10000,
      max_restarts: 100,
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};