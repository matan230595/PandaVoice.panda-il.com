module.exports = {
  apps: [
    {
      name: 'pandavoice',
      script: './dist/server/index.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATA_DIR: '/opt/pandavoice/data',
        AUDIO_DIR: '/opt/pandavoice/data/audio'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
