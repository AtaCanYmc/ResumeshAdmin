-- 1. ENUM Tiplerinin Oluşturulması
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'article_platform') THEN
        CREATE TYPE article_platform AS ENUM ('MEDIUM', 'DEV_TO');
    END IF;
END $$;

-- 2. USERS TABLOSU (Admin Kimlik Doğrulaması İçin)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. PROJECTS TABLOSU (GitHub Verileri)
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(512) NOT NULL UNIQUE,
    stars INT DEFAULT 0,
    watchers INT DEFAULT 0,
    forks INT DEFAULT 0,
    languages TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. ARTICLES TABLOSU (Medium & Dev.to Verileri)
CREATE TABLE IF NOT EXISTS articles (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    url VARCHAR(512) NOT NULL UNIQUE,
    platform article_platform NOT NULL,
    reading_time_minutes INT DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    raw_platform_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. EXPERIENCES TABLOSU (LinkedIn veya Manuel Deneyimler)
CREATE TABLE IF NOT EXISTS experiences (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CERTIFICATES TABLOSU (Sertifikalar)
CREATE TABLE IF NOT EXISTS certificates (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    issuing_organization VARCHAR(255) NOT NULL,
    issue_date DATE,
    expiration_date DATE,
    credential_id VARCHAR(255),
    credential_url VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SYSTEM LOGS TABLOSU (Log Havuzu)
CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    level VARCHAR(50) NOT NULL,
    module VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. GENERATED CVS TABLOSU (AI CV Geçmişi)
CREATE TABLE IF NOT EXISTS generated_cvs (
    id BIGSERIAL PRIMARY KEY,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    job_description_url VARCHAR(512),
    raw_job_description TEXT,
    cv_content_markdown TEXT NOT NULL,
    pdf_file_path VARCHAR(512),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. SOCIAL_LINKS TABLOSU
CREATE TABLE IF NOT EXISTS social_links (
    id VARCHAR(36) PRIMARY KEY,
    platform VARCHAR(50) NOT NULL,
    label VARCHAR(100) NOT NULL,
    url VARCHAR(512) NOT NULL,
    icon VARCHAR(100),
    order_index INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. SECTIONS TABLOSU
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(36) PRIMARY KEY,
    key VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Performans İçin Temel İndekslerin Atılması (Faz 3 Arama Optimizasyonu)
CREATE INDEX IF NOT EXISTS idx_projects_languages ON projects USING gin (languages);
CREATE INDEX IF NOT EXISTS idx_projects_tags ON projects USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs (level);
CREATE INDEX IF NOT EXISTS idx_social_links_platform ON social_links (platform);
CREATE INDEX IF NOT EXISTS idx_sections_key ON sections (key);
