/**
 * PM2 Ecosystem Config — BookIntelligence
 * Usage:
 *   pm2 start ecosystem.config.js        # first run
 *   pm2 reload ecosystem.config.js       # zero-downtime reload
 *   pm2 save                             # persist across reboots
 *   pm2 startup                          # auto-start on server boot
 */

module.exports = {
  apps: [
    // ── Backend ───────────────────────────────────────────────────────────────
    {
      name: "bookintelligence-api",
      script: "./backend/dist/server.js",
      cwd: "./backend",
      instances: "max",          // one process per CPU core
      exec_mode: "cluster",      // cluster mode for load balancing
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      // Log rotation
      error_file: "./logs/api-error.log",
      out_file: "./logs/api-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      // Graceful shutdown
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,
    },

    // ── Frontend (Next.js standalone) ─────────────────────────────────────────
    {
      name: "bookintelligence-web",
      script: "npm",
      args: "start",
      cwd: "./frontend",
      instances: 1,
      watch: false,
      max_memory_restart: "800M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file: "./logs/web-error.log",
      out_file: "./logs/web-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      kill_timeout: 5000,
    },
  ],
}
