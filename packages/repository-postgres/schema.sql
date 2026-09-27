create table if not exists renditionkit_assets (
  id text primary key,
  namespace text not null default 'default',
  media_type text not null,
  source_key text not null,
  attributes jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'ready', 'rejected', 'failed')),
  checksum text,
  source_bytes bigint,
  source_content_type text,
  inspection jsonb,
  renditions jsonb,
  transform_metadata jsonb,
  rendition_version integer not null default 0,
  processing_started_at timestamptz,
  attempt integer not null default 0,
  job_id text,
  error_code text,
  error_message text,
  error_details jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists renditionkit_assets_status_idx
  on renditionkit_assets (status, processing_started_at);

create unique index if not exists renditionkit_assets_ready_checksum_idx
  on renditionkit_assets (namespace, checksum)
  where checksum is not null and status = 'ready';
