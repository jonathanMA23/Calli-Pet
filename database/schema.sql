BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('tutor', 'provider', 'admin');
CREATE TYPE provider_type AS ENUM (
  'veterinaria','grooming','paseador','cuidador',
  'entrenador','comercio','refugio','transporte'
);
CREATE TYPE pet_species AS ENUM ('perro', 'gato', 'otro');
CREATE TYPE booking_status AS ENUM ('pendiente','confirmada','completada','cancelada');
CREATE TYPE payment_status AS ENUM ('pendiente','pagado','reembolsado','fallido');
CREATE TYPE incident_severity AS ENUM ('baja','media','alta','critica');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  phone VARCHAR(25),
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'tutor',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label VARCHAR(80) NOT NULL DEFAULT 'Principal',
  street TEXT NOT NULL,
  alcaldia VARCHAR(120) NOT NULL,
  postal_code VARCHAR(10),
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  species pet_species NOT NULL,
  breed VARCHAR(120),
  sex CHAR(1) CHECK (sex IN ('M','F')),
  birth_date DATE,
  weight_kg NUMERIC(6,2) CHECK (weight_kg IS NULL OR weight_kg > 0),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE RESTRICT,
  commercial_name VARCHAR(180) NOT NULL,
  provider_type provider_type NOT NULL,
  description TEXT,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating_avg BETWEEN 0 AND 5),
  alcaldia VARCHAR(120) NOT NULL,
  latitude NUMERIC(9,6),
  longitude NUMERIC(9,6),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE provider_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  file_url TEXT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pendiente',
  expires_on DATE
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(140) NOT NULL UNIQUE,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  base_duration_minutes INTEGER CHECK (base_duration_minutes > 0),
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE provider_services (
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  home_service BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (provider_id, service_id)
);

CREATE TABLE provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  weekday SMALLINT NOT NULL CHECK (weekday BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 1 CHECK (max_capacity > 0),
  CHECK (start_time < end_time)
);

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE RESTRICT,
  address_id UUID REFERENCES user_addresses(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status booking_status NOT NULL DEFAULT 'pendiente',
  total_amount NUMERIC(12,2) NOT NULL CHECK (total_amount >= 0),
  platform_commission NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (platform_commission >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE RESTRICT,
  payment_provider VARCHAR(80) NOT NULL,
  external_reference VARCHAR(180),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (commission_amount >= 0),
  status payment_status NOT NULL DEFAULT 'pendiente',
  paid_at TIMESTAMPTZ
);

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  reported_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE RESTRICT,
  severity incident_severity NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'abierto',
  description TEXT NOT NULL,
  resolved_at TIMESTAMPTZ
);

CREATE TABLE pet_health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
  record_type VARCHAR(100) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  occurred_on DATE NOT NULL,
  next_due_on DATE,
  file_url TEXT
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notification_type VARCHAR(80) NOT NULL,
  title VARCHAR(180) NOT NULL,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pets_owner ON pets(owner_id);
CREATE INDEX idx_providers_type_zone ON providers(provider_type, alcaldia);
CREATE INDEX idx_provider_services_service ON provider_services(service_id);
CREATE INDEX idx_bookings_user_date ON bookings(user_id, scheduled_at);
CREATE INDEX idx_bookings_provider_date ON bookings(provider_id, scheduled_at);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);
CREATE INDEX idx_incidents_provider ON incidents(provider_id);
CREATE INDEX idx_health_pet_date ON pet_health_records(pet_id, occurred_on);

COMMIT;
