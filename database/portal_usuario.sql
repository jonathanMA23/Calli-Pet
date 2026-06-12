CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS adoption_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    species VARCHAR(30) NOT NULL CHECK (species IN ('perro', 'gato', 'otro')),
    breed VARCHAR(120),
    sex CHAR(1) CHECK (sex IN ('M', 'F')),
    age_months INTEGER CHECK (age_months IS NULL OR age_months >= 0),
    size VARCHAR(30),
    description TEXT,
    shelter_name VARCHAR(180) NOT NULL,
    alcaldia VARCHAR(120) NOT NULL,
    image_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'disponible'
        CHECK (status IN ('disponible', 'en_proceso', 'adoptado')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (name, shelter_name)
);

CREATE TABLE IF NOT EXISTS adoption_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES adoption_listings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    message TEXT,
    housing_type VARCHAR(80),
    has_other_pets BOOLEAN NOT NULL DEFAULT FALSE,
    phone VARCHAR(25),
    status VARCHAR(30) NOT NULL DEFAULT 'enviada'
        CHECK (status IN ('enviada', 'en_revision', 'aprobada', 'rechazada', 'cancelada')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (listing_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_adoption_listings_status
    ON adoption_listings(status);

CREATE INDEX IF NOT EXISTS idx_adoption_applications_user
    ON adoption_applications(user_id);

INSERT INTO adoption_listings (
    name,
    species,
    breed,
    sex,
    age_months,
    size,
    description,
    shelter_name,
    alcaldia,
    status
)
VALUES
(
    'Canelo',
    'perro',
    'Mestizo',
    'M',
    18,
    'mediano',
    'Sociable, activo y acostumbrado a convivir con personas.',
    'Red Calli Adopta',
    'Coyoacán',
    'disponible'
),
(
    'Nube',
    'gato',
    'Doméstico de pelo corto',
    'F',
    10,
    'pequeño',
    'Tranquila, curiosa y con protocolo veterinario completo.',
    'Red Calli Adopta',
    'Benito Juárez',
    'disponible'
),
(
    'Bruno',
    'perro',
    'Mestizo',
    'M',
    36,
    'grande',
    'Cariñoso, con energía moderada y buen comportamiento en paseos.',
    'Red Calli Adopta',
    'Álvaro Obregón',
    'disponible'
)
ON CONFLICT (name, shelter_name) DO NOTHING;
