# Contrato inicial de API

Base:

```text
/api/v1
```

## Autenticación

| Método | Ruta | Rol |
|---|---|---|
| POST | `/auth/register` | Público |
| POST | `/auth/login` | Público |
| POST | `/auth/logout` | Autenticado |
| GET | `/users/me` | Autenticado |
| PATCH | `/users/me` | Autenticado |

## Mascotas

| Método | Ruta | Rol |
|---|---|---|
| GET | `/pets` | Tutor |
| POST | `/pets` | Tutor |
| GET | `/pets/:id` | Propietario |
| PATCH | `/pets/:id` | Propietario |
| GET | `/pets/:id/records` | Autorizado |

## Proveedores

| Método | Ruta | Rol |
|---|---|---|
| GET | `/providers` | Público |
| GET | `/providers/:id` | Público |
| GET | `/providers/me` | Proveedor |
| PATCH | `/providers/me` | Proveedor |
| POST | `/providers/me/services` | Proveedor |
| GET | `/providers/me/bookings` | Proveedor |

## Reservas

| Método | Ruta | Rol |
|---|---|---|
| POST | `/bookings` | Tutor |
| GET | `/bookings` | Autenticado |
| GET | `/bookings/:id` | Participante |
| PATCH | `/bookings/:id/status` | Participante autorizado |

## Pagos

| Método | Ruta | Rol |
|---|---|---|
| POST | `/payments/intents` | Tutor |
| POST | `/payments/webhook` | Proveedor de pago |
| GET | `/payments/:id` | Usuario autorizado |

## Calidad

| Método | Ruta | Rol |
|---|---|---|
| POST | `/reviews` | Tutor |
| POST | `/incidents` | Autenticado |
| GET | `/incidents/:id` | Participante o admin |

## Administración

| Método | Ruta | Rol |
|---|---|---|
| GET | `/admin/providers/pending` | Admin |
| PATCH | `/admin/providers/:id/verify` | Admin |
| GET | `/admin/incidents` | Admin |
| PATCH | `/admin/incidents/:id` | Admin |
