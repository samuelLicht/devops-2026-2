// Mide cuánto tarda en estar "healthy" cada servicio tras `docker compose up`.
// Uso: npm run timing:startup
import { execSync } from "node:child_process";

const run = (c) => execSync(c, { encoding: "utf8" }).trim();
const t0 = Date.now();
console.log("Reiniciando stack (down + up --build)...");
run("docker compose down");
const buildStart = Date.now();
run("docker compose build");
const buildSec = ((Date.now() - buildStart) / 1000).toFixed(1);
run("docker compose up -d");

const services = ["devops-postgres", "devops-mongo"];
const ready = {};
while (Object.keys(ready).length < services.length && Date.now() - t0 < 180000) {
  for (const s of services) {
    if (ready[s]) continue;
    const st = run(`docker inspect -f "{{.State.Health.Status}}" ${s}`);
    if (st === "healthy") ready[s] = ((Date.now() - t0) / 1000).toFixed(1);
  }
  await new Promise((r) => setTimeout(r, 500));
}
let apiSec = "timeout";
while (Date.now() - t0 < 180000) {
  try {
    const r = await fetch("http://localhost:3000/health");
    if (r.ok) { apiSec = ((Date.now() - t0) / 1000).toFixed(1); break; }
  } catch {}
  await new Promise((r) => setTimeout(r, 300));
}
console.table([
  { Servicio: "build imagen api", "segundos": buildSec },
  { Servicio: "postgres healthy", "segundos": ready["devops-postgres"] },
  { Servicio: "mongo healthy", "segundos": ready["devops-mongo"] },
  { Servicio: "api responde /health", "segundos": apiSec },
]);
