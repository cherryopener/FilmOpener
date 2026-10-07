-- ==============================================================================
-- FilmOpener - Supabase Database Schema
-- Run this script in the Supabase SQL Editor to set up your tables and security.
-- ==============================================================================

-- 1. Films Table (보유 필름 목록)
CREATE TABLE IF NOT EXISTS films (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL, -- bw_negative, bw_slide, color_negative, color_slide, cinema, cinema_ahu, other
  format VARCHAR(50) NOT NULL, -- 135, 120, 220, large_sheet, 110, other
  iso INTEGER NOT NULL DEFAULT 400,
  expiry_date VARCHAR(20) NOT NULL,
  storage_method VARCHAR(50) NOT NULL DEFAULT 'room_temp', -- room_temp, refrigerated, frozen
  is_bulk_rolled BOOLEAN NOT NULL DEFAULT FALSE,
  is_expired BOOLEAN NOT NULL DEFAULT FALSE,
  is_rebranded BOOLEAN NOT NULL DEFAULT FALSE,
  original_film_info TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  frames_per_roll INTEGER NOT NULL DEFAULT 36,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Cameras Table (보유 카메라 목록)
CREATE TABLE IF NOT EXISTS cameras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand VARCHAR(150) NOT NULL,
  model VARCHAR(150) NOT NULL,
  format VARCHAR(50) NOT NULL, -- 135_full, 135_half, 120_645, 120_66, 120_67, 120_69, large_4x5, large_8x10, panorama, other
  lens_type VARCHAR(50) NOT NULL DEFAULT 'interchangeable', -- interchangeable, fixed
  fixed_lens_name VARCHAR(255),
  fixed_focal_length NUMERIC(6, 2),
  fixed_max_aperture NUMERIC(4, 2),
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, needs_repair, in_repair, for_sale, collection
  serial_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Lenses Table (보유 렌즈 목록)
CREATE TABLE IF NOT EXISTS lenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  brand VARCHAR(150) NOT NULL,
  name VARCHAR(255) NOT NULL,
  format_compatibility VARCHAR(100) NOT NULL DEFAULT '135',
  lens_category VARCHAR(50) NOT NULL DEFAULT 'prime', -- prime, zoom
  focal_length_min NUMERIC(6, 2) NOT NULL,
  focal_length_max NUMERIC(6, 2) NOT NULL,
  max_aperture NUMERIC(4, 2) NOT NULL,
  mount VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  serial_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Developer Chemicals Table (현상액 관리)
CREATE TABLE IF NOT EXISTS developer_chemicals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  manufacturer VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL, -- bw, color, cinema, slide, other
  purchase_date VARCHAR(20) NOT NULL,
  mixed_or_opened_date VARCHAR(20) NOT NULL,
  total_rolls_processed INTEGER NOT NULL DEFAULT 0,
  total_batches INTEGER NOT NULL DEFAULT 0,
  dilution_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
  capacity_rolls_limit INTEGER,
  volume_ml NUMERIC(8, 2),
  current_volume_ml NUMERIC(8, 2),
  last_used_date VARCHAR(20),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Shooting Rolls Table (촬영 관리)
CREATE TABLE IF NOT EXISTS shooting_rolls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  film_id UUID REFERENCES films(id) ON DELETE SET NULL,
  film_name_snapshot VARCHAR(255) NOT NULL,
  camera_id UUID REFERENCES cameras(id) ON DELETE SET NULL,
  camera_name_snapshot VARCHAR(255) NOT NULL,
  lens_id UUID REFERENCES lenses(id) ON DELETE SET NULL,
  lens_name_snapshot VARCHAR(255),
  loaded_date VARCHAR(20) NOT NULL,
  unloaded_date VARCHAR(20),
  status VARCHAR(50) NOT NULL DEFAULT 'loaded', -- loaded, unloaded, developed, scanned
  shooting_sessions JSONB NOT NULL DEFAULT '[]'::jsonb,
  iso_rated INTEGER,
  total_shots INTEGER,
  dev_type VARCHAR(50) NOT NULL DEFAULT 'none', -- lab, self, none
  lab_name VARCHAR(255),
  developed_date VARCHAR(20),
  developer_id UUID REFERENCES developer_chemicals(id) ON DELETE SET NULL,
  developer_name_snapshot VARCHAR(255),
  dev_method VARCHAR(50), -- rotary, inversion, stand, semi_stand, other
  dilution_ratio VARCHAR(50),
  dev_quantity_rolls INTEGER NOT NULL DEFAULT 1,
  chemical_volume_ml NUMERIC(8, 2),
  dilution_liquid_volume_ml NUMERIC(8, 2),
  agitation_details TEXT,
  dev_temp_celsius NUMERIC(4, 1),
  dev_time VARCHAR(50),
  stop_fix_wash_notes TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Scan Logs Table (필름 스캔 관리)
CREATE TABLE IF NOT EXISTS scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  roll_id UUID REFERENCES shooting_rolls(id) ON DELETE SET NULL,
  is_legacy_archive BOOLEAN NOT NULL DEFAULT FALSE,
  film_title VARCHAR(255) NOT NULL,
  camera_lens_info VARCHAR(255),
  scan_method VARCHAR(50) NOT NULL, -- flatbed, dslr, dedicated, lab, other
  scanner_model VARCHAR(255),
  total_frames INTEGER NOT NULL DEFAULT 36,
  folder_name VARCHAR(255) NOT NULL,
  storage_path TEXT,
  software_used VARCHAR(255),
  scan_date VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for high-performance sorting and querying
CREATE INDEX IF NOT EXISTS idx_films_brand ON films(brand);
CREATE INDEX IF NOT EXISTS idx_films_type ON films(type);
CREATE INDEX IF NOT EXISTS idx_films_iso ON films(iso);
CREATE INDEX IF NOT EXISTS idx_films_expiry ON films(expiry_date);
CREATE INDEX IF NOT EXISTS idx_cameras_status ON cameras(status);
CREATE INDEX IF NOT EXISTS idx_lenses_focal ON lenses(focal_length_min);
CREATE INDEX IF NOT EXISTS idx_shooting_rolls_status ON shooting_rolls(status);
CREATE INDEX IF NOT EXISTS idx_scan_logs_date ON scan_logs(scan_date);

-- Enable Row Level Security (RLS)
ALTER TABLE films ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_chemicals ENABLE ROW LEVEL SECURITY;
ALTER TABLE shooting_rolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE scan_logs ENABLE ROW LEVEL SECURITY;

-- Default permissive policy for authenticated users, with fallback for public access if needed
CREATE POLICY "Allow public all for films" ON films FOR ALL USING (true);
CREATE POLICY "Allow public all for cameras" ON cameras FOR ALL USING (true);
CREATE POLICY "Allow public all for lenses" ON lenses FOR ALL USING (true);
CREATE POLICY "Allow public all for developer_chemicals" ON developer_chemicals FOR ALL USING (true);
CREATE POLICY "Allow public all for shooting_rolls" ON shooting_rolls FOR ALL USING (true);
CREATE POLICY "Allow public all for scan_logs" ON scan_logs FOR ALL USING (true);
