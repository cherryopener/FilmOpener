-- ==============================================================================
-- FilmOpener - Supabase Cloud Database Schema & Row Level Security (RLS)
-- ==============================================================================
-- 이 SQL 스크립트는 Supabase 대시보드의 [SQL Editor]에 붙여넣고 [Run]을 누르면
-- 모든 테이블 생성, 외래 키, 유저별 행 단위 보안(RLS), 최신 컬럼 마이그레이션이 1번에 완성됩니다.
-- ==============================================================================

-- 1. 보유 필름 보관함 (films)
create table if not exists public.films (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  brand text not null,
  type text not null,
  format text not null,
  iso integer not null,
  expiry_date text not null,
  storage_method text not null,
  is_bulk_rolled boolean default false,
  is_expired boolean default false,
  freshness_status text default 'fresh',
  is_rebranded boolean default false,
  original_film_info text,
  quantity integer default 1,
  frames_per_roll integer default 36,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 기존 테이블이 있을 경우 누락된 컬럼 추가 (Safe Migration)
alter table public.films add column if not exists freshness_status text default 'fresh';
alter table public.films add column if not exists is_rebranded boolean default false;
alter table public.films add column if not exists original_film_info text;
alter table public.films add column if not exists frames_per_roll integer default 36;

-- 2. 카메라 바디 보관함 (cameras)
create table if not exists public.cameras (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  brand text not null,
  model text not null,
  format text not null,
  lens_type text not null,
  fixed_lens_name text,
  fixed_focal_length numeric,
  fixed_max_aperture numeric,
  status text not null default 'active',
  serial_number text,
  mount text,
  image_url text,
  notes text,
  created_at timestamptz default now()
);

-- 기존 테이블이 있을 경우 누락된 컬럼 추가 (Safe Migration)
alter table public.cameras add column if not exists mount text;
alter table public.cameras add column if not exists image_url text;

-- 3. 렌즈 보관함 (lenses)
create table if not exists public.lenses (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  brand text not null,
  name text not null,
  format_compatibility text default '135',
  lens_category text not null default 'prime',
  focal_length_min numeric not null,
  focal_length_max numeric not null,
  max_aperture numeric not null,
  mount text,
  status text not null default 'active',
  serial_number text,
  notes text,
  created_at timestamptz default now()
);

-- 4. 현상액 라이브러리 (developer_chemicals)
create table if not exists public.developer_chemicals (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  manufacturer text not null,
  type text not null,
  purchase_date text,
  mixed_or_opened_date text,
  total_rolls_processed integer default 0,
  total_batches integer default 0,
  dilution_usage jsonb default '{}'::jsonb,
  capacity_rolls_limit integer,
  volume_ml numeric,
  current_volume_ml numeric,
  last_used_date text,
  notes text,
  created_at timestamptz default now()
);

-- 5. 촬영 및 현상 롤 (shooting_rolls)
create table if not exists public.shooting_rolls (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  title text not null,
  film_id text,
  film_name_snapshot text not null,
  camera_id text,
  camera_name_snapshot text not null,
  lens_id text,
  lens_name_snapshot text,
  loaded_date text not null,
  unloaded_date text,
  status text not null default 'loaded',
  shooting_sessions jsonb default '[]'::jsonb,
  iso_rated integer,
  total_shots integer,
  dev_type text default 'none',
  lab_name text,
  developed_date text,
  developer_id text,
  developer_name_snapshot text,
  dev_method text,
  dilution_ratio text,
  dev_quantity_rolls integer default 1,
  chemical_volume_ml numeric,
  dilution_liquid_volume_ml numeric,
  agitation_details text,
  dev_temp_celsius numeric,
  dev_time text,
  stop_fix_wash_notes text,
  is_external_roll boolean default false,
  external_film_info text,
  external_film_type text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 기존 테이블이 있을 경우 누락된 컬럼 추가 (Safe Migration)
alter table public.shooting_rolls add column if not exists is_external_roll boolean default false;
alter table public.shooting_rolls add column if not exists external_film_info text;
alter table public.shooting_rolls add column if not exists external_film_type text;

-- 6. 스캐너 및 디지타이징 장비 (scanners)
create table if not exists public.scanners (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  name text not null,
  category text not null default 'digitizing',
  brand text,
  sensor_or_light text,
  holder_type text,
  notes text,
  created_at timestamptz default now()
);

-- 7. 스캔 아카이브 장부 (scan_logs)
create table if not exists public.scan_logs (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null default auth.uid(),
  roll_id text,
  scanner_id text,
  is_legacy_archive boolean default false,
  film_title text not null,
  camera_lens_info text,
  scan_method text not null,
  scanner_model text,
  lab_scanner text,
  lab_resolution text default 'standard',
  total_frames integer default 36,
  folder_name text not null,
  storage_path text,
  folder_color text,
  software_used text,
  scan_date text not null,
  notes text,
  created_at timestamptz default now()
);

-- 기존 테이블이 있을 경우 누락된 컬럼 추가 (Safe Migration)
alter table public.scan_logs add column if not exists scanner_id text;
alter table public.scan_logs add column if not exists lab_scanner text;
alter table public.scan_logs add column if not exists lab_resolution text default 'standard';
alter table public.scan_logs add column if not exists folder_color text;

-- ==============================================================================
-- 8. Row Level Security (RLS) 활성화 - 나만 접근할 수 있는 강력한 보안 장벽
-- ==============================================================================

alter table public.films enable row level security;
alter table public.cameras enable row level security;
alter table public.lenses enable row level security;
alter table public.developer_chemicals enable row level security;
alter table public.shooting_rolls enable row level security;
alter table public.scanners enable row level security;
alter table public.scan_logs enable row level security;

-- 기존 정책이 있다면 삭제 후 재적용
drop policy if exists "Users can access own films" on public.films;
drop policy if exists "Users can access own cameras" on public.cameras;
drop policy if exists "Users can access own lenses" on public.lenses;
drop policy if exists "Users can access own developers" on public.developer_chemicals;
drop policy if exists "Users can access own rolls" on public.shooting_rolls;
drop policy if exists "Users can access own scanners" on public.scanners;
drop policy if exists "Users can access own scans" on public.scan_logs;

-- 각 테이블별 RLS 정책: 오직 로그인한 본인(auth.uid() = user_id)만 읽기/쓰기/수정/삭제 가능
create policy "Users can access own films" on public.films
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can access own cameras" on public.cameras
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can access own lenses" on public.lenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can access own developers" on public.developer_chemicals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can access own rolls" on public.shooting_rolls
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can access own scanners" on public.scanners
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can access own scans" on public.scan_logs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ==============================================================================
-- 9. 성능 최적화 인덱스 (user_id 기준)
-- ==============================================================================
create index if not exists idx_films_user_id on public.films(user_id);
create index if not exists idx_cameras_user_id on public.cameras(user_id);
create index if not exists idx_lenses_user_id on public.lenses(user_id);
create index if not exists idx_developers_user_id on public.developer_chemicals(user_id);
create index if not exists idx_rolls_user_id on public.shooting_rolls(user_id);
create index if not exists idx_scanners_user_id on public.scanners(user_id);
create index if not exists idx_scans_user_id on public.scan_logs(user_id);
