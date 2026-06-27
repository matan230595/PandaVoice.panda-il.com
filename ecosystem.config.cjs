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
        DATA_DIR: '/home/matanadmin/web/dev.panda-il.com/public_html/data',
        AUDIO_DIR: '/home/matanadmin/web/dev.panda-il.com/public_html/data/audio'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true
    }
  ]
};
