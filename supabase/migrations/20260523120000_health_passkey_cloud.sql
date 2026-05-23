-- Phase 3: server passkeys + encrypted cloud backup (Supabase)

create table if not exists health_users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  display_name text not null default 'Health user',
  created_at timestamptz not null default now()
);

create table if not exists webauthn_challenges (
  id uuid primary key,
  challenge text not null,
  user_id uuid references health_users (id) on delete cascade,
  type text not null check (type in ('registration', 'authentication')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists webauthn_challenges_expires_idx on webauthn_challenges (expires_at);

create table if not exists passkey_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references health_users (id) on delete cascade,
  credential_id text not null unique,
  public_key text not null,
  counter bigint not null default 0,
  device_name text,
  transports text[] default '{}',
  created_at timestamptz not null default now(),
  last_used_at timestamptz
);

create index if not exists passkey_credentials_user_idx on passkey_credentials (user_id);

create table if not exists health_sessions (
  token uuid primary key,
  user_id uuid not null references health_users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists health_sessions_expires_idx on health_sessions (expires_at);

create table if not exists encrypted_health_plans (
  user_id uuid primary key references health_users (id) on delete cascade,
  ciphertext text not null,
  iv text not null,
  version int not null default 1,
  updated_at timestamptz not null default now()
);

-- RLS: service role used by API; anon clients should not read ciphertext directly.
alter table health_users enable row level security;
alter table passkey_credentials enable row level security;
alter table encrypted_health_plans enable row level security;
alter table health_sessions enable row level security;
alter table webauthn_challenges enable row level security;
