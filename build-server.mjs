import { build } from 'esbuild';
import { rm, mkdir } from 'fs/promises';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname);
const distDir = join(rootDir, 'dist', 'server');

async function main() {
  console.log('Building server...');

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await build({
    entryPoints: [join(rootDir, 'src', 'server', 'index.ts')],
    outdir: distDir,
    platform: 'node',
    format: 'esm',
    target: 'node22',
    sourcemap: false,
    minify: false,
    bundle: true,
    external: ['better-sqlite3', 'hono', '@hono/node-server'],
    alias: {
      '@': join(rootDir, 'src'),
    },
    define: { 'process.env.NODE_ENV': '"production"' },
  });

  console.log('Server build complete →', distDir);
}

main().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
