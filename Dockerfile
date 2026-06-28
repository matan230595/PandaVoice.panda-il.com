# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-slim AS builder
WORKDIR /app

# Build tools needed for better-sqlite3 native module
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build:all

# Prune dev dependencies (keeps better-sqlite3 native binaries intact)
RUN npm prune --omit=dev

# ─── Stage 2: Production ──────────────────────────────────────────────────────
FROM node:22-slim AS runner
WORKDIR /app

# Copy pre-compiled node_modules (same base image = compatible native binaries)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

RUN mkdir -p /app/data/audio /app/logs

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    DATA_DIR=/app/data \
    AUDIO_DIR=/app/data/audio

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>r.ok?process.exit(0):process.exit(1)).catch(()=>process.exit(1))"

CMD ["node", "dist/server/index.js"]
