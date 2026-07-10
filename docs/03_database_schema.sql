-- PostgreSQL Enterprise Database Schema for Al-Rabb Tours & Travels
-- Uses UUIDs, strict constraints, and modern indexing.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for statuses
CREATE TYPE request_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'PROCESSING', 'APPROVED', 'REJECTED', 'COMPLETED');
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'AGENCY', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE room_type AS ENUM ('QUAD', 'PENTAGONAL', 'HEXAGONAL');

-- USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AGENCIES
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    address TEXT,
    logo_url VARCHAR(1024),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CUSTOMERS
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    passport_number VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- BASE REQUESTS (Polymorphic base for Visa and Tickets)
CREATE TABLE requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_type VARCHAR(50) NOT NULL, -- 'GROUP_VISA', 'INDIVIDUAL_VISA', 'AIR_TICKET'
    agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    status request_status DEFAULT 'DRAFT',
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- GROUP VISA REQUESTS
CREATE TABLE group_visas (
    request_id UUID PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
    number_of_passengers INTEGER NOT NULL,
    flight_itinerary TEXT NOT NULL,
    flight_code VARCHAR(100) NOT NULL,
    travel_date DATE NOT NULL,
    country_code VARCHAR(10) NOT NULL,
    group_leader_name VARCHAR(255) NOT NULL,
    india_number VARCHAR(50) NOT NULL,
    saudi_number VARCHAR(50) NOT NULL
);

-- HOTELS (Makkah & Madinah for Group Visas)
CREATE TABLE group_visa_hotels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_visa_id UUID REFERENCES group_visas(request_id) ON DELETE CASCADE,
    city VARCHAR(50) NOT NULL, -- 'MAKKAH' or 'MADINAH'
    hotel_name VARCHAR(255) NOT NULL,
    room_type room_type NOT NULL,
    room_count INTEGER NOT NULL,
    check_in DATE NOT NULL,
    check_out DATE NOT NULL
);

-- TRANSPORT (For Group Visas)
CREATE TABLE group_visa_transports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_visa_id UUID REFERENCES group_visas(request_id) ON DELETE CASCADE,
    transport_type VARCHAR(100) NOT NULL, -- 'AIRPORT_PICKUP', 'MAKKAH_ZIYARAH', etc.
    travel_date DATE NOT NULL,
    travel_time TIME NOT NULL,
    session VARCHAR(10) NOT NULL -- 'FN' or 'AN'
);

-- INDIVIDUAL VISA REQUESTS (Normal and Iqama)
CREATE TABLE individual_visas (
    request_id UUID PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
    visa_subtype VARCHAR(50) NOT NULL, -- 'NORMAL' or 'IQAMA'
    passengers INTEGER NOT NULL,
    arrival_date DATE NOT NULL,
    departure_date DATE,
    stay_days INTEGER NOT NULL,
    saudi_number VARCHAR(50) NOT NULL,
    india_number VARCHAR(50) NOT NULL,
    
    -- Specific to Iqama
    iqama_holder_name VARCHAR(255),
    iqama_id VARCHAR(100),
    dob DATE,
    national_address TEXT
);

-- AIR TICKET REQUESTS
CREATE TABLE air_tickets (
    request_id UUID PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
    origin VARCHAR(100) NOT NULL,
    destination VARCHAR(100) NOT NULL,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    passengers INTEGER NOT NULL,
    preferred_airline VARCHAR(255),
    luggage_weight INTEGER,
    wheelchair_required BOOLEAN DEFAULT FALSE,
    meal_preference VARCHAR(255),
    additional_notes TEXT
);

-- ATTACHMENTS (Polymorphic documents)
CREATE TABLE attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(1024) NOT NULL, -- S3/R2 Key
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(1024),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- INDEXES
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_agency ON requests(agency_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
