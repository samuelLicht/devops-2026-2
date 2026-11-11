# Medición de rendimiento y trazabilidad

Rama: `timing-samuel` (creada desde `main`, sin PR).

## Servicios medidos

| Servicio | Imagen / origen | Puerto |
|----------|-----------------|--------|
| api      | build del `Dockerfile` (Node 22 + Express) | 3000 |
| postgres | `postgres:16-alpine` | 5432 |
| mongo    | `mongo:7` | 27017 |

## Scripts

- `npm run timing:startup`: tiempo de build y de arranque (healthy) de cada servicio.
- `npm run benchmark:service`: latencia (avg, p95, max), throughput (req/s) por endpoint y consumo de CPU/memoria por contenedor (`docker stats`).

## Resultados

### Arranque

| Etapa | Segundos |
|-------|----------|
| Build imagen api | 38.8 |
| postgres healthy | 48.1 |
| mongo healthy | 48.2 |
| api responde /health | 48.9 |

### Latencia y throughput

300 peticiones, concurrencia 10.

| Endpoint | avg ms | p95 ms | max ms | req/s | errores |
|----------|--------|--------|--------|-------|---------|
| GET /health | 7.98 | 20.06 | 43.30 | 1220 | 0 |
| GET /api/postgres/health | 9.58 | 14.18 | 50.76 | 1028 | 0 |
| GET /api/postgres/users | 10.09 | 15.58 | 22.21 | 979 | 0 |
| POST /api/postgres/users | 12.93 | 18.34 | 22.29 | 762 | 0 |
| GET /api/mongo/health | 11.75 | 19.69 | 27.44 | 836 | 0 |
| GET /api/mongo/users | 11.79 | 17.59 | 33.69 | 838 | 0 |
| POST /api/mongo/users | 10.53 | 14.95 | 27.12 | 941 | 0 |

### Recursos por contenedor

| Contenedor | CPU % | Memoria | Mem % |
|------------|-------|---------|-------|
| devops-api | 0.17 | 68.89 MiB | 0.90 |
| devops-postgres | 3.28 | 38.6 MiB | 0.51 |
| devops-mongo | 1.47 | 181.3 MiB | 2.37 |

## Trazabilidad

commit → rama `timing-samuel` → imagen Docker → contenedores en `docker compose`.
