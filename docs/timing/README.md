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
_Pegar tabla de `npm run timing:startup`_

### Latencia y throughput
_Pegar tabla de `npm run benchmark:service`_

### Recursos por contenedor
_Pegar tabla de docker stats_

## Trazabilidad

commit → rama `timing-samuel` → imagen Docker → contenedores en `docker compose`.
