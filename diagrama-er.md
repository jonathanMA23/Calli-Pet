# Diagrama entidad-relación de Calli Pet

```mermaid
erDiagram

    USERS {
        uuid id PK
        varchar full_name
        varchar email UK
        varchar phone
        text password_hash
        user_role role
        boolean is_active
        timestamptz created_at
    }

    USER_ADDRESSES {
        uuid id PK
        uuid user_id FK
        varchar label
        text street
        varchar alcaldia
        varchar postal_code
        numeric latitude
        numeric longitude
        boolean is_primary
    }

    PETS {
        uuid id PK
        uuid owner_id FK
        varchar name
        pet_species species
        varchar breed
        char sex
        date birth_date
        numeric weight_kg
        text notes
        boolean is_active
    }

    PROVIDERS {
        uuid id PK
        uuid owner_user_id FK
        varchar commercial_name
        provider_type provider_type
        text description
        boolean verified
        numeric rating_avg
        varchar alcaldia
        numeric latitude
        numeric longitude
        boolean is_active
    }

    PROVIDER_DOCUMENTS {
        uuid id PK
        uuid provider_id FK
        varchar document_type
        text file_url
        varchar status
        date expires_on
    }

    SERVICES {
        uuid id PK
        varchar name UK
        varchar category
        text description
        integer base_duration_minutes
        boolean is_active
    }

    PROVIDER_SERVICES {
        uuid provider_id PK, FK
        uuid service_id PK, FK
        numeric price
        integer duration_minutes
        boolean home_service
        boolean is_active
    }

    PROVIDER_AVAILABILITY {
        uuid id PK
        uuid provider_id FK
        smallint weekday
        time start_time
        time end_time
        integer max_capacity
    }

    BOOKINGS {
        uuid id PK
        uuid user_id FK
        uuid pet_id FK
        uuid provider_id FK
        uuid service_id FK
        uuid address_id FK
        timestamptz scheduled_at
        booking_status status
        numeric total_amount
        numeric platform_commission
        text notes
        timestamptz created_at
    }

    PAYMENTS {
        uuid id PK
        uuid booking_id FK, UK
        varchar payment_provider
        varchar external_reference
        numeric amount
        numeric commission_amount
        payment_status status
        timestamptz paid_at
    }

    REVIEWS {
        uuid id PK
        uuid booking_id FK, UK
        uuid user_id FK
        uuid provider_id FK
        smallint rating
        text comment
        timestamptz created_at
    }

    INCIDENTS {
        uuid id PK
        uuid booking_id FK
        uuid reported_by_user_id FK
        uuid provider_id FK
        incident_severity severity
        varchar status
        text description
        timestamptz resolved_at
    }

    PET_HEALTH_RECORDS {
        uuid id PK
        uuid pet_id FK
        uuid provider_id FK
        varchar record_type
        varchar title
        text description
        date occurred_on
        date next_due_on
        text file_url
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        varchar notification_type
        varchar title
        text body
        timestamptz read_at
        timestamptz created_at
    }

    USERS ||--o{ USER_ADDRESSES : registra
    USERS ||--o{ PETS : posee
    USERS ||--o| PROVIDERS : administra
    USERS ||--o{ BOOKINGS : realiza
    USERS ||--o{ REVIEWS : publica
    USERS ||--o{ INCIDENTS : reporta
    USERS ||--o{ NOTIFICATIONS : recibe

    PETS ||--o{ BOOKINGS : participa
    PETS ||--o{ PET_HEALTH_RECORDS : tiene

    PROVIDERS ||--o{ PROVIDER_DOCUMENTS : acredita
    PROVIDERS ||--o{ PROVIDER_SERVICES : ofrece
    PROVIDERS ||--o{ PROVIDER_AVAILABILITY : define
    PROVIDERS ||--o{ BOOKINGS : atiende
    PROVIDERS ||--o{ REVIEWS : recibe
    PROVIDERS ||--o{ INCIDENTS : involucra
    PROVIDERS ||--o{ PET_HEALTH_RECORDS : registra

    SERVICES ||--o{ PROVIDER_SERVICES : configura
    SERVICES ||--o{ BOOKINGS : se_reserva

    USER_ADDRESSES ||--o{ BOOKINGS : ubica

    BOOKINGS ||--o| PAYMENTS : genera
    BOOKINGS ||--o| REVIEWS : recibe
    BOOKINGS ||--o{ INCIDENTS : origina
```

## Cardinalidades principales

- Un usuario puede registrar varias direcciones.
- Un tutor puede registrar varias mascotas.
- Una cuenta de proveedor administra un perfil de proveedor en el MVP.
- Un proveedor puede ofrecer varios servicios.
- Un servicio puede ser ofrecido por varios proveedores.
- Una reserva vincula a un tutor, una mascota, un proveedor y un servicio.
- Una reserva puede generar un pago y una evaluación.
- Una reserva puede originar varios incidentes.
- Una mascota puede tener múltiples registros en su expediente.
