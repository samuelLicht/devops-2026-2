// Mide latencia (avg, p95, max), throughput y consumo de recursos de cada servicio.
// Uso: npm run benchmark:service   (requiere `docker compose up -d` corriendo)
import { execSync } from "node:child_process";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const REQUESTS = Number(process.env.REQUESTS ?? 300);
const CONCURRENCY = Number(process.env.CONCURRENCY ?? 10);

const endpoints = [
  { name: "API  GET /health", method: "GET", path: "/health" },
  { name: "PG   GET /api/postgres/health", method: "GET", path: "/api/postgres/health" },
  { name: "PG   GET /api/postgres/users", method: "GET", path: "/api/postgres/users" },
  { name: "PG   POST /api/postgres/users", method: "POST", path: "/api/postgres/users", body: () => ({ name: "bench", email: `b${Date.now()}${Math.random()}@t.com` }) },
  { name: "MONGO GET /api/mongo/health", method: "GET", path: "/api/mongo/health" },
  { name: "MONGO GET /api/mongo/users", method: "GET", path: "/api/mongo/users" },
  { name: "MONGO POST /api/mongo/users", method: "POST", path: "/api/mongo/users", body: () => ({ name: "bench", email: `b${Date.now()}${Math.random()}@t.com` }) },
];

const pct = (arr, p) => arr[Math.min(arr.length - 1, Math.ceil((p / 100) * arr.length) - 1)];

async function one(ep) {
  const t0 = performance.now();
  const res = await fetch(BASE + ep.path, {
    method: ep.method,
    headers: { "content-type": "application/json" },
    body: ep.body ? JSON.stringify(ep.body()) : undefined,
  });
  await res.text();
  return { ms: performance.now() - t0, ok: res.status < 400 };
}

async function bench(ep) {
  await one(ep); // warm-up
  const times = [];
  let errors = 0, next = 0;
  const start = performance.now();
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (next++ < REQUESTS) {
      const r = await one(ep);
      times.push(r.ms);
      if (!r.ok) errors++;
    }
  }));
  const total = (performance.now() - start) / 1000;
  times.sort((a, b) => a - b);
  return {
    Endpoint: ep.name,
    "avg ms": (times.reduce((a, b) => a + b, 0) / times.length).toFixed(2),
    "p95 ms": pct(times, 95).toFixed(2),
    "max ms": times[times.length - 1].toFixed(2),
    "req/s": (times.length / total).toFixed(0),
    errores: errors,
  };
}

console.log(`Benchmark contra ${BASE} — ${REQUESTS} peticiones, concurrencia ${CONCURRENCY}\n`);
const rows = [];
for (const ep of endpoints) rows.push(await bench(ep));
console.table(rows);

console.log("\nRecursos por contenedor (docker stats):");
try {
  console.log(execSync(
    'docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}"',
    { encoding: "utf8" }
  ));
} catch {
  console.log("No se pudo ejecutar docker stats (¿Docker corriendo?).");
}
