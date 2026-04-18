-- Hidden Factory MVP — Phase 0 초기 스키마
-- 적용: pnpm dlx supabase@latest db push  (또는 supabase db reset)

create extension if not exists "pgcrypto";

-- ──────────────────────────────────────────────────────────────────────────
-- Enums
-- ──────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_category') then
    create type public.store_category as enum (
      'RESIN', 'POTTERY', 'PAINTING', 'CALLIGRAPHY', 'GLASS', 'HANJI', 'OTHER'
    );
  end if;
end $$;

-- ──────────────────────────────────────────────────────────────────────────
-- updated_at 자동 갱신 함수 (4개 테이블 공용)
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ──────────────────────────────────────────────────────────────────────────
-- stores
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.stores (
  id              uuid primary key default gen_random_uuid(),
  owner_user_id   uuid not null references auth.users(id) on delete cascade,
  name            text not null,
  category        public.store_category not null default 'OTHER',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists stores_owner_user_id_idx on public.stores(owner_user_id);

drop trigger if exists stores_set_updated_at on public.stores;
create trigger stores_set_updated_at
  before update on public.stores
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- customers (PII 최소 수집)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null references public.stores(id) on delete cascade,
  name            text not null,
  phone           text,
  memo            text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists customers_store_id_idx on public.customers(store_id);

drop trigger if exists customers_set_updated_at on public.customers;
create trigger customers_set_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- artworks (status TEXT 허용 — Phase 1 에서 Enum 승격 예정)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.artworks (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null references public.stores(id) on delete cascade,
  customer_id     uuid references public.customers(id) on delete set null,
  title           text,
  status          text not null default 'DRAFT',
  share_token     uuid not null unique default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists artworks_store_id_idx on public.artworks(store_id);
create index if not exists artworks_customer_id_idx on public.artworks(customer_id);

drop trigger if exists artworks_set_updated_at on public.artworks;
create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- marketing_contents (Gemini 생성물)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.marketing_contents (
  id              uuid primary key default gen_random_uuid(),
  store_id        uuid not null references public.stores(id) on delete cascade,
  kind            text not null,
  prompt          text,
  output          text,
  meta            jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists marketing_contents_store_id_idx
  on public.marketing_contents(store_id);

drop trigger if exists marketing_contents_set_updated_at on public.marketing_contents;
create trigger marketing_contents_set_updated_at
  before update on public.marketing_contents
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- RLS 활성화
-- ──────────────────────────────────────────────────────────────────────────
alter table public.stores             enable row level security;
alter table public.customers          enable row level security;
alter table public.artworks           enable row level security;
alter table public.marketing_contents enable row level security;

-- ──────────────────────────────────────────────────────────────────────────
-- 정책: stores — 본인 소유만
-- ──────────────────────────────────────────────────────────────────────────
drop policy if exists "stores: owner can select" on public.stores;
create policy "stores: owner can select" on public.stores
  for select to authenticated
  using (owner_user_id = auth.uid());

drop policy if exists "stores: owner can insert" on public.stores;
create policy "stores: owner can insert" on public.stores
  for insert to authenticated
  with check (owner_user_id = auth.uid());

drop policy if exists "stores: owner can update" on public.stores;
create policy "stores: owner can update" on public.stores
  for update to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

drop policy if exists "stores: owner can delete" on public.stores;
create policy "stores: owner can delete" on public.stores
  for delete to authenticated
  using (owner_user_id = auth.uid());

-- ──────────────────────────────────────────────────────────────────────────
-- 정책 헬퍼: 현재 유저가 해당 store_id 의 owner 인가?
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.is_store_owner(p_store_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.stores s
    where s.id = p_store_id and s.owner_user_id = auth.uid()
  );
$$;

grant execute on function public.is_store_owner(uuid) to authenticated;

-- ──────────────────────────────────────────────────────────────────────────
-- 정책: customers / artworks / marketing_contents — 소유 매장 한정
-- ──────────────────────────────────────────────────────────────────────────
drop policy if exists "customers: owner of store can all" on public.customers;
create policy "customers: owner of store can all" on public.customers
  for all to authenticated
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));

drop policy if exists "artworks: owner of store can all" on public.artworks;
create policy "artworks: owner of store can all" on public.artworks
  for all to authenticated
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));

drop policy if exists "marketing_contents: owner of store can all" on public.marketing_contents;
create policy "marketing_contents: owner of store can all" on public.marketing_contents
  for all to authenticated
  using (public.is_store_owner(store_id))
  with check (public.is_store_owner(store_id));

-- ──────────────────────────────────────────────────────────────────────────
-- 토큰 기반 공개 열람 (anon)
--   ▸ RLS 에 anon SELECT 를 직접 허용하면 전체 스캔이 가능해지므로
--   ▸ SECURITY DEFINER RPC 를 통해 최소 컬럼만 노출한다.
--   ▸ URL 에는 숫자/UUID id 가 아닌 share_token 만 사용.
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.get_artwork_by_share_token(p_token uuid)
returns table (
  id          uuid,
  title       text,
  status      text,
  created_at  timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.title, a.status, a.created_at
  from public.artworks a
  where a.share_token = p_token
  limit 1;
$$;

revoke all on function public.get_artwork_by_share_token(uuid) from public;
grant execute on function public.get_artwork_by_share_token(uuid)
  to anon, authenticated;
