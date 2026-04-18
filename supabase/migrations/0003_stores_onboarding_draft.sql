-- Hidden Factory — Phase 1-b 온보딩 Draft/Resume 스키마
-- 적용: pnpm dlx supabase@latest db push

-- ──────────────────────────────────────────────────────────────────────────
-- 1) stores 컬럼 재구성
--    - name: Draft 저장 허용을 위해 NOT NULL 해제 (Step 1 완료 시점에 채워짐)
--    - address: 자유 입력 → region_sido/region_sigungu/address_detail 로 정규화
--    - tagline: 매장 한 줄 소개 (Step 2)
--    - onboarding_step: 1(시작)~3(검토), onboarded_at: 완료 시각
-- ──────────────────────────────────────────────────────────────────────────

-- name NOT NULL 해제 (Draft 허용)
alter table public.stores alter column name drop not null;

-- 구(舊) 자유 입력 address 컬럼 제거 — 아직 데이터 없는 초기 구축 단계
alter table public.stores drop column if exists address;

-- 지역 정규화 컬럼 + 한줄 소개
alter table public.stores
  add column if not exists region_sido     text,
  add column if not exists region_sigungu  text,
  add column if not exists address_detail  text,
  add column if not exists tagline         text;

-- 온보딩 진행 상태
alter table public.stores
  add column if not exists onboarding_step smallint not null default 1,
  add column if not exists onboarded_at    timestamptz;

-- 1~3 범위 제약 (CHECK)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'stores_onboarding_step_range'
  ) then
    alter table public.stores
      add constraint stores_onboarding_step_range
      check (onboarding_step between 1 and 3);
  end if;
end $$;

-- ──────────────────────────────────────────────────────────────────────────
-- 2) "한 유저 = 한 스토어" 제약 (UNIQUE)
--    기존 non-unique 인덱스 제거 후 UNIQUE 인덱스로 교체
-- ──────────────────────────────────────────────────────────────────────────
drop index if exists public.stores_owner_user_id_idx;

create unique index if not exists stores_owner_user_id_uniq
  on public.stores(owner_user_id);
