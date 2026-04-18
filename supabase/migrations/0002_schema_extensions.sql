-- Hidden Factory — Phase 0.5 스키마 확장
-- 적용: pnpm dlx supabase@latest db push

-- ──────────────────────────────────────────────────────────────────────────
-- 1) stores 확장 필드
-- ──────────────────────────────────────────────────────────────────────────
alter table public.stores
  add column if not exists address          text,
  add column if not exists phone            text,
  add column if not exists instagram_url    text,
  add column if not exists naver_place_url  text,
  add column if not exists kakao_channel_url text,
  add column if not exists business_hours   jsonb,
  add column if not exists logo_url         text;

-- ──────────────────────────────────────────────────────────────────────────
-- 2) artworks.status: text → artwork_status enum 승격
-- ──────────────────────────────────────────────────────────────────────────
do $$
begin
  if not exists (select 1 from pg_type where typname = 'artwork_status') then
    create type public.artwork_status as enum (
      'DRAFT', 'IN_PROGRESS', 'READY', 'DELIVERED', 'ARCHIVED'
    );
  end if;
end $$;

alter table public.artworks alter column status drop default;
alter table public.artworks
  alter column status type public.artwork_status using status::public.artwork_status;
alter table public.artworks alter column status set default 'DRAFT';

-- ──────────────────────────────────────────────────────────────────────────
-- 3) Storage 버킷
--    - store-assets: 로고/매장 사진 (public read)
--    - artwork-photos: 작품 사진 (private, 공개 시 시그니드 URL)
--    경로 규약: <store_id>/<path...>  ← RLS 가 첫 폴더로 소유자 판단
-- ──────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('store-assets', 'store-assets', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('artwork-photos', 'artwork-photos', false)
  on conflict (id) do nothing;

-- ──────────────────────────────────────────────────────────────────────────
-- 4) Storage RLS — storage.objects 기준
-- ──────────────────────────────────────────────────────────────────────────

-- store-assets: 누구나 읽기
drop policy if exists "store-assets: public read" on storage.objects;
create policy "store-assets: public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'store-assets');

-- store-assets: owner 만 쓰기 (경로 첫 폴더가 자기 매장 id)
drop policy if exists "store-assets: owner write" on storage.objects;
create policy "store-assets: owner write" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'store-assets'
    and public.is_store_owner(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "store-assets: owner update" on storage.objects;
create policy "store-assets: owner update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'store-assets'
    and public.is_store_owner(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'store-assets'
    and public.is_store_owner(((storage.foldername(name))[1])::uuid)
  );

drop policy if exists "store-assets: owner delete" on storage.objects;
create policy "store-assets: owner delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'store-assets'
    and public.is_store_owner(((storage.foldername(name))[1])::uuid)
  );

-- artwork-photos: owner 전용 전체 권한 (공개 열람은 다음 Phase 의 시그니드 URL RPC 로 처리)
drop policy if exists "artwork-photos: owner all" on storage.objects;
create policy "artwork-photos: owner all" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'artwork-photos'
    and public.is_store_owner(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'artwork-photos'
    and public.is_store_owner(((storage.foldername(name))[1])::uuid)
  );
