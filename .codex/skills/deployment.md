# PandaVoice — Deployment Guide

## VPS Details

- **Host:** `root@164.68.109.11`
- **Domain:** `pandavoice.panda-il.com`
- **Webroot:** `/home/matanadmin/web/pandavoice.panda-il.com/public_html/`
- **Server manager:** Hestia Control Panel

## Build

```bash
npm run build:all   # vite build (→ dist/) + esbuild (→ dist/server/)
```

Output:
```
dist/
  index.html          # React SPA entry
  assets/             # Vite chunks (JS/CSS)
  server/index.js     # Bundled Node.js server
```

## PM2 Config (ecosystem.config.cjs)

```
name: pandavoice
script: dist/server/index.js
env: { PORT: 3000, NODE_ENV: production, AUDIO_DIR: /path/to/data/audio }
```

Commands:
```bash
npm run pm2:start    # pm2 start ecosystem.config.cjs
npm run pm2:restart  # restart after deploy
npm run pm2:logs     # tail logs
```

## nginx Config

```nginx
server {
    listen 443 ssl;
    server_name pandavoice.panda-il.com;

    auth_basic "PandaVoice";
    auth_basic_user_file /etc/nginx/.htpasswd-pandavoice;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        client_max_body_size 50M;
    }
}
```

Create htpasswd:
```bash
htpasswd -c /etc/nginx/.htpasswd-pandavoice admin
```

## Deploy Steps

```bash
# On VPS
git pull origin main
npm install --production=false
npm run build:all
npm run pm2:restart
```

Or first deploy:
```bash
npm install
npm run build:all
npm run pm2:start
```

## Environment Variables

| Variable | Default | Notes |
|----------|---------|-------|
| `PORT` | 3000 | Node.js listen port |
| `NODE_ENV` | production | |
| `AUDIO_DIR` | `./data/audio` | Absolute path recommended on VPS |

No API keys in server env — all AI keys come from the client request body.

## Data Directories

```
data/
  pandavoice.db    # SQLite database
  audio/           # WebM recordings (gitignored)
backups/           # Optional: manual DB backups
```

Set `AUDIO_DIR` to an absolute path outside the repo, e.g. `/var/pandavoice/audio`.
