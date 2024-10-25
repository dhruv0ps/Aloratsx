module.exports = {
  apps: [
    {
      name: 'Dev-backend-app',
      script: 'npm',
      args: 'start',
      cwd: './Backend',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '3G',
    },
    {
      name: 'Dev-frontend-app',
      script: 'serve',
      env: {
        PM2_SERVE_PATH: './Frontend/dist',
        PM2_SERVE_PORT: 5173,
        PM2_SERVE_SPA: 'true',
        PM2_SERVE_HOMEPAGE: '/index.html',
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
    },
  ],
};