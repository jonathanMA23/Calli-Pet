# Calli Pet Platform

Repositorio académico y técnico de Calli Pet.

## Contenido
- Modelo PostgreSQL.
- Datos de prueba.
- Diagrama entidad-relación.
- Reglas de negocio.
- Espacios para backend y frontend.
- Ejecución local con Docker Compose.

## Inicio rápido en macOS

```bash
cp .env.example .env
docker compose up -d
docker compose ps
docker exec -it calli_pet_db psql -U callipet -d callipet
```

Dentro de PostgreSQL:

```sql
\dt
SELECT * FROM bookings;
\q
```

## Reiniciar la base

```bash
./scripts/reset-db.sh
```

## Estructura

```text
database/   Scripts SQL
docs/       Modelo y documentación
backend/    Implementación futura de API
frontend/   Implementación futura de aplicación web
```
