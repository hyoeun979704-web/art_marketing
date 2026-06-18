-- Hidden Factory — Phase 2: 소비자 발견(큐레이션) + 컨시어지 작가 등록
-- 적용: pnpm dlx supabase@latest db push
--
-- 설계 메모:
--  - 컨시어지 모델: 작가는 로그인하지 않는다. 운영팀이 service-role(admin client)로 대신 등록.
--    → stores.owner_user_id 를 NULL 허용으로 풀고, UNIQUE 는 "계정 연결된 경우만" 부분 적용.
--  - 소비자 발견은 익명(anon) 공개. RLS 전체 노출 대신 SECURITY DEFINER RPC 로 "공개 컬럼만"
--    내보낸다(전화 등 PII 비노출). is_published = true 인 행만.
--  - 작품 매칭/큐레이션 속성은 artworks.match_tags(jsonb) — docs/curation-matching.md §3 택소노미.

-- ──────────────────────────────────────────────────────────────────────────
-- 1) stores: 작가 공개 프로필 + 컨시어지(계정 비연결) 허용
-- ──────────────────────────────────────────────────────────────────────────
alter table public.stores alter column owner_user_id drop not null;

-- "한 유저 = 한 스토어"는 계정이 연결된 경우에만 적용(컨시어지 NULL 다수 허용)
drop index if exists public.stores_owner_user_id_uniq;
create unique index if not exists stores_owner_user_id_uniq
  on public.stores(owner_user_id)
  where owner_user_id is not null;

alter table public.stores
  add column if not exists slug                text,
  add column if not exists story               text,   -- 인터뷰에서 추출한 작가 서사
  add column if not exists interview_video_url text,   -- 편집된 인터뷰 영상(hero)
  add column if not exists hero_image_url       text,
  add column if not exists is_published         boolean not null default false,
  add column if not exists published_at         timestamptz;

create unique index if not exists stores_slug_uniq
  on public.stores(slug) where slug is not null;
create index if not exists stores_is_published_idx
  on public.stores(is_published) where is_published = true;

-- ──────────────────────────────────────────────────────────────────────────
-- 2) artworks: 발견/큐레이션용 공개 필드 + 매칭 태그
-- ──────────────────────────────────────────────────────────────────────────
alter table public.artworks
  add column if not exists description       text,
  add column if not exists price             integer,        -- 원 단위(표시용). NULL = 가격문의
  add column if not exists price_tier        text,           -- '1-5만'|'5-15만'|'15만+'
  add column if not exists primary_image_url text,
  add column if not exists match_tags        jsonb not null default '{}'::jsonb,
  add column if not exists is_published      boolean not null default false,
  add column if not exists published_at      timestamptz;

create index if not exists artworks_is_published_idx
  on public.artworks(is_published) where is_published = true;
-- 태그 필터(@>) 가속
create index if not exists artworks_match_tags_gin
  on public.artworks using gin (match_tags);

-- ──────────────────────────────────────────────────────────────────────────
-- 3) 공개 발견 RPC (anon) — 공개 컬럼만, is_published 한정. PII(phone) 비노출.
-- ──────────────────────────────────────────────────────────────────────────

-- 3-1) 작품 큐레이션 피드 (필터: 카테고리 / 무드 / 검색 / 페이지)
create or replace function public.discover_artworks(
  p_category public.store_category default null,
  p_mood     text    default null,
  p_limit    integer default 24,
  p_offset   integer default 0
)
returns table (
  artwork_id        uuid,
  title             text,
  price             integer,
  price_tier        text,
  primary_image_url text,
  match_tags        jsonb,
  store_id          uuid,
  artist_name       text,
  artist_slug       text,
  category          public.store_category,
  region_sido       text,
  region_sigungu    text
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.title, a.price, a.price_tier, a.primary_image_url, a.match_tags,
         s.id, s.name, s.slug, s.category, s.region_sido, s.region_sigungu
  from public.artworks a
  join public.stores s on s.id = a.store_id
  where a.is_published = true
    and s.is_published = true
    and (p_category is null or s.category = p_category)
    and (p_mood is null or a.match_tags -> 'mood' ? p_mood)
  order by a.published_at desc nulls last, a.created_at desc
  limit greatest(1, least(p_limit, 60))
  offset greatest(0, p_offset);
$$;

-- 3-2) 작품 상세 + 작가 요약
create or replace function public.get_public_artwork(p_artwork_id uuid)
returns table (
  artwork_id        uuid,
  title             text,
  description       text,
  price             integer,
  price_tier        text,
  primary_image_url text,
  match_tags        jsonb,
  store_id          uuid,
  artist_name       text,
  artist_slug       text,
  category          public.store_category,
  region_sido       text,
  region_sigungu    text
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.title, a.description, a.price, a.price_tier, a.primary_image_url, a.match_tags,
         s.id, s.name, s.slug, s.category, s.region_sido, s.region_sigungu
  from public.artworks a
  join public.stores s on s.id = a.store_id
  where a.id = p_artwork_id and a.is_published = true and s.is_published = true
  limit 1;
$$;

-- 3-3) 작가 공개 프로필(슬러그) — 리드젠 채널(instagram/naver/kakao) 포함, phone 제외
create or replace function public.get_public_artist(p_slug text)
returns table (
  store_id            uuid,
  slug                text,
  name                text,
  category            public.store_category,
  region_sido         text,
  region_sigungu      text,
  tagline             text,
  story               text,
  interview_video_url text,
  hero_image_url      text,
  instagram_url       text,
  naver_place_url     text,
  kakao_channel_url   text
)
language sql
stable
security definer
set search_path = public
as $$
  select s.id, s.slug, s.name, s.category, s.region_sido, s.region_sigungu,
         s.tagline, s.story, s.interview_video_url, s.hero_image_url,
         s.instagram_url, s.naver_place_url, s.kakao_channel_url
  from public.stores s
  where s.slug = p_slug and s.is_published = true
  limit 1;
$$;

-- 3-4) 작가의 공개 작품 목록
create or replace function public.get_public_artist_artworks(p_slug text)
returns table (
  artwork_id        uuid,
  title             text,
  price             integer,
  price_tier        text,
  primary_image_url text,
  match_tags        jsonb
)
language sql
stable
security definer
set search_path = public
as $$
  select a.id, a.title, a.price, a.price_tier, a.primary_image_url, a.match_tags
  from public.artworks a
  join public.stores s on s.id = a.store_id
  where s.slug = p_slug and s.is_published = true and a.is_published = true
  order by a.published_at desc nulls last, a.created_at desc;
$$;

revoke all on function public.discover_artworks(public.store_category, text, integer, integer) from public;
revoke all on function public.get_public_artwork(uuid) from public;
revoke all on function public.get_public_artist(text) from public;
revoke all on function public.get_public_artist_artworks(text) from public;

grant execute on function public.discover_artworks(public.store_category, text, integer, integer) to anon, authenticated;
grant execute on function public.get_public_artwork(uuid) to anon, authenticated;
grant execute on function public.get_public_artist(text) to anon, authenticated;
grant execute on function public.get_public_artist_artworks(text) to anon, authenticated;
