/**
 * BookIntelligence Load Test
 * Run: node load-test.js
 * Requires server running at http://localhost:5000
 * and autocannon: npm install autocannon --save-dev
 */

const autocannon = require("autocannon")

const BASE = "http://localhost:5000"

// ── Scenarios ────────────────────────────────────────────────────────────────

const scenarios = [
  {
    name: "Book Search",
    url: `${BASE}/api/books/search?q=harry+potter`,
    method: "GET",
  },
  {
    name: "Trending Books",
    url: `${BASE}/api/recommendations/trending`,
    method: "GET",
  },
  {
    name: "Get All Listings",
    url: `${BASE}/api/listings`,
    method: "GET",
  },
  {
    name: "Get All Posts",
    url: `${BASE}/api/posts`,
    method: "GET",
  },
]

// ── Runner ────────────────────────────────────────────────────────────────────

async function runScenario(scenario) {
  return new Promise((resolve) => {
    const instance = autocannon({
      url:         scenario.url,
      method:      scenario.method,
      connections: 10,      // concurrent connections
      duration:    10,      // seconds
      pipelining:  1,
      headers: scenario.headers ?? {},
      body: scenario.body ? JSON.stringify(scenario.body) : undefined,
    }, (err, result) => {
      if (err) {
        console.error(`[${scenario.name}] Error:`, err.message)
        resolve(null)
        return
      }

      const p = result.latency
      console.log(`\n── ${scenario.name} ──`)
      console.log(`  Requests/sec : ${result.requests.mean.toFixed(0)}`)
      console.log(`  Throughput   : ${(result.throughput.mean / 1024).toFixed(1)} KB/s`)
      console.log(`  Latency avg  : ${p.mean.toFixed(1)} ms`)
      console.log(`  Latency p99  : ${p.p99} ms`)
      console.log(`  2xx          : ${result["2xx"]}`)
      console.log(`  Non-2xx      : ${result.non2xx}`)
      console.log(`  Errors       : ${result.errors}`)
      resolve(result)
    })

    autocannon.track(instance, { renderProgressBar: true })
  })
}

async function main() {
  console.log("BookIntelligence Load Test")
  console.log("==========================")
  console.log(`Target: ${BASE}`)
  console.log("Duration: 10s per scenario, 10 concurrent connections\n")

  const results = []
  for (const scenario of scenarios) {
    const result = await runScenario(scenario)
    if (result) results.push({ name: scenario.name, rps: result.requests.mean, errors: result.errors })
  }

  console.log("\n══ Summary ══════════════════════════════════")
  for (const r of results) {
    const status = r.errors > 0 ? "⚠️" : "✓"
    console.log(`  ${status}  ${r.name.padEnd(25)} ${r.rps.toFixed(0).padStart(6)} req/s   errors: ${r.errors}`)
  }
  console.log("═════════════════════════════════════════════")
}

main().catch(console.error)
