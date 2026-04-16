#!/usr/bin/env bash
# BookIntelligence — server-side deployment script
# Runs on the VPS after rsync pushes new code.
# Called by the CD workflow: bash deploy.sh

set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_DIR"

echo "[deploy] Starting deployment at $(date)"

# ── Backend ───────────────────────────────────────────────────────────────────
echo "[deploy] Installing backend dependencies..."
cd "$DEPLOY_DIR/backend"
npm ci --omit=dev

echo "[deploy] Generating Prisma client..."
npx prisma generate

echo "[deploy] Running database migrations..."
npx prisma migrate deploy

echo "[deploy] Building backend..."
npm run build

# ── Frontend ──────────────────────────────────────────────────────────────────
echo "[deploy] Installing frontend dependencies..."
cd "$DEPLOY_DIR/frontend"
npm ci

echo "[deploy] Building frontend..."
npm run build

# ── Restart services with PM2 ─────────────────────────────────────────────────
cd "$DEPLOY_DIR"

echo "[deploy] Restarting services..."
if pm2 list | grep -q "bookintelligence"; then
  pm2 reload ecosystem.config.js --update-env
else
  pm2 start ecosystem.config.js
  pm2 save
fi

echo "[deploy] Done at $(date)"
