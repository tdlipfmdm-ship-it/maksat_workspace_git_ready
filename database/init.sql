-- Maksat Workspace Production Database Initialization

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sso_user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'viewer',
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS dicom_studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploader_id UUID REFERENCES users(id),
    study_instance_uid VARCHAR(128) NOT NULL UNIQUE,
    patient_anon_id VARCHAR(64) NOT NULL,
    modality VARCHAR(16) NOT NULL,
    slices_count INT NOT NULL DEFAULT 1,
    file_path VARCHAR(512) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash CHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    event_type VARCHAR(64) NOT NULL,
    resource_id VARCHAR(128),
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Belligi: Esasy Administrator Ulanyjysy
INSERT INTO users (id, sso_user_id, email, full_name, role, is_approved)
VALUES (
    uuid_generate_v4(),
    'admin_root_chatgpt',
    'admin@maksat.workspace',
    'Baş Administrator',
    'admin',
    TRUE
) ON CONFLICT DO NOTHING;
