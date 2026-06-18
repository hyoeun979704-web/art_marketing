# 개발 계약 (Front ↔ Back Contracts) — 단일 소스

> 목적: 프론트엔드·백엔드·DB 사이의 **정확한 계약**(컬럼·타입·RPC 시그니처·액션 입출력)을 한 곳에 못박아
> **드리프트와 런타임 버그를 차단**한다. 코드 작성·수정 전 **반드시 이 문서를 먼저 확인**한다.
> 변경 시 이 문서를 같이 고친다(코드만 바꾸고 문서 누락 금지).

## 0. 환경·규약 (Next.js 16 / React 19 / Tailwind v4)

- `cookies()`·`headers()`·페이지 `params`·`searchParams` = **모두 async (await 필수)**.
- 서버 액션 파일 `"use server"`, 반환은 `{ error: string } | undefined` 또는 `{ ok: true, ... }`. 성공 시 `redirect()` 또는 `revalidatePath()`.
- Supabase: 서버 `await createClient()`(`lib/supabase/server`), 관리자 쓰기 `createAdminClient()`(`lib/supabase/admin`, service-role, RLS 우회).
- 입력은 **항상 zod 검증** 후 신뢰. 클라이언트 입력을 그대로 DB에 넣지 않는다.
- 비밀키(`SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `ADMIN_EMAILS`)는 **서버 전용**(`lib/env.ts requireServerEnv`).

## 1. DB 스키마 (0001~0004 적용 후 — 진짜 소스)

### `public.stores` (작가/공방)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | gen_random_uuid() |
| owner_user_id | uuid **NULL 허용** | 컨시어지 작가는 NULL. UNIQUE는 NOT NULL인 경우만(부분 인덱스) |
| name | text NULL | |
| category | store_category NOT NULL | 기본 'OTHER' |
| region_sido / region_sigungu / address_detail | text NULL | |
| tagline | text NULL | 한 줄 소개(≤80) |
| phone | text NULL | **내부용·비공개(공개 RPC 미노출)** |
| instagram_url / naver_place_url / kakao_channel_url | text NULL | **리드젠 채널(공개)** |
| business_hours | jsonb NULL | (미사용) |
| logo_url | text NULL | (미사용, hero_image_url 사용) |
| slug | text NULL UNIQUE(부분) | 공개 URL `/artist/[slug]`. ascii 권장 `[a-z0-9-]` |
| story | text NULL | 인터뷰 추출 작가 서사 |
| interview_video_url | text NULL | 편집 인터뷰 영상 링크 |
| hero_image_url | text NULL | 작가 대표 이미지 |
| is_published | boolean NOT NULL default false | 공개 게이트 |
| published_at | timestamptz NULL | |
| onboarding_step | smallint NOT NULL default 1 | (작가 셀프 온보딩용, 컨시어지는 무시) |
| created_at / updated_at | timestamptz | updated_at 트리거 자동 |

### `public.artworks` (작품)
| 컬럼 | 타입 | 비고 |
|---|---|---|
| id | uuid PK | |
| store_id | uuid NOT NULL FK→stores | |
| customer_id | uuid NULL FK→customers | (미사용) |
| title | text NULL | |
| status | artwork_status NOT NULL default 'DRAFT' | DRAFT·IN_PROGRESS·READY·DELIVERED·ARCHIVED |
| share_token | uuid NOT NULL UNIQUE | |
| description | text NULL | |
| price | integer NULL | 원 단위. NULL=가격문의 |
| price_tier | text NULL | '1-5만'·'5-15만'·'15만+' |
| primary_image_url | text NULL | |
| match_tags | jsonb NOT NULL default '{}' | §3 구조 |
| is_published | boolean NOT NULL default false | |
| published_at | timestamptz NULL | |
| created_at / updated_at | timestamptz | |

### 기타
- `customers`, `marketing_contents`(kind·prompt·output·meta jsonb) — 0001 그대로.
- 스토리지 버킷: `store-assets`(public read), `artwork-photos`(private). 경로 첫 폴더=store_id로 RLS 판단(작가 셀프용).
  **컨시어지 업로드는 service-role(admin client)로 `store-assets`에** 올린다(공개 URL). 경로 규약: `concierge/<store_id>/<filename>`.
- RLS: stores/customers/artworks/marketing_contents 모두 owner 기준(authenticated). **컨시어지(owner NULL) 행은 일반
  authenticated로 접근 불가** → 관리자 쓰기·조회는 **admin client(service-role)** 사용.

## 2. 공개 발견 RPC (anon/authenticated) — 프론트는 이 시그니처에 **정확히** 맞춘다

> PostgREST는 named-arg 매칭 → 인자 이름/집합이 어긋나면 PGRST202(전량 실패). 아래 인자명을 그대로 쓴다.

| RPC | 인자 | 반환 컬럼 |
|---|---|---|
| `discover_artworks` | `p_category`(store_category\|null), `p_mood`(text\|null), `p_limit`(int=24), `p_offset`(int=0) | artwork_id, title, price, price_tier, primary_image_url, match_tags, store_id, artist_name, artist_slug, category, region_sido, region_sigungu |
| `get_public_artwork` | `p_artwork_id`(uuid) | 위 + description (artist_* 포함) |
| `get_public_artist` | `p_slug`(text) | store_id, slug, name, category, region_sido, region_sigungu, tagline, story, interview_video_url, hero_image_url, instagram_url, naver_place_url, kakao_channel_url |
| `get_public_artist_artworks` | `p_slug`(text) | artwork_id, title, price, price_tier, primary_image_url, match_tags |

- 전부 `is_published=true`(작가·작품 양쪽) 행만. phone 미노출.
- 프론트 래퍼: `lib/discovery.ts` (반환 타입 `ArtworkCard`/`ArtworkDetail`/`ArtistProfile`/`ArtistArtwork`은 위 컬럼과 1:1).

## 3. `match_tags` (jsonb) 구조 — docs/curation-matching.md §3 택소노미

```jsonc
{
  "style":    "내추럴",            // 단일(선택)
  "mood":     ["따뜻", "차분"],     // 배열 — discover_artworks 의 p_mood 가 ? 연산으로 매칭
  "color":    ["크림", "청록"],      // 배열
  "occasion": ["집들이", "선물"],    // 배열
  "values":   ["수제", "로컬"],      // 배열
  "price_tier": "1-5만"            // 단일(선택; artworks.price_tier 와 동일값 권장)
}
```
- 무드 필터가 동작하려면 **mood 는 반드시 JSON 배열**. 빈값은 키 생략 또는 `[]`.
- `lib/taste.ts tagList()` 가 안전 파싱. 무드 값 목록 = `lib/taste.ts MOODS`.

## 4. 관리자(컨시어지) 도구 계약

### 인증·인가
- `lib/env.ts` 에 server key `ADMIN_EMAILS`(콤마구분 이메일) 추가.
- `lib/admin/auth.ts`:
  - `getAdminUser()` → 로그인 유저가 ADMIN_EMAILS 에 있으면 user, 아니면 null.
  - `requireAdmin()` → 아니면 `redirect("/login")`. (서버 컴포넌트·액션 양쪽에서 호출)
- **모든 admin 서버 액션은 첫 줄에서 `requireAdmin()`** 후 `createAdminClient()` 사용(클라 신뢰 금지).

### 페이지 (`app/admin/*`, 서버 컴포넌트, admin client로 전체 조회)
- `/admin` — 작가(stores) 목록(이름·slug·게시여부·작품수) + "새 작가".
- `/admin/artists/new` — 작가 생성 폼.
- `/admin/artists/[id]` — 작가 수정 + 그 작가의 작품 목록/추가/수정/게시토글.

### 서버 액션 (`app/admin/actions.ts`, `"use server"`)
| 액션 | 입력(zod) | 동작 | 반환 |
|---|---|---|---|
| `createArtist` | artistSchema | stores insert(owner_user_id=null) | `{ ok, id }` \| `{ error }` |
| `updateArtist` | {id}+artistSchema | stores update by id | 〃 |
| `setArtistPublished` | {id, published:boolean} | is_published(+published_at) | 〃 |
| `createArtwork` | {storeId}+artworkSchema | artworks insert | `{ ok, id }` |
| `updateArtwork` | {id}+artworkSchema | artworks update | 〃 |
| `setArtworkPublished` | {id, published} | is_published(+published_at) | 〃 |
| `uploadImage` | FormData(file, storeId, kind) | admin client storage upload → public URL | `{ ok, url }` \| `{ error }` |

- 성공 후 `revalidatePath("/admin")` 및 관련 경로, 소비자 측은 동적 렌더라 자동 최신.

### zod 스키마 (`lib/schemas/admin.ts`)
- `artistSchema`: name(1~50), slug(`^[a-z0-9-]{2,40}$`), category(STORE_CATEGORIES), region_sido/region_sigungu(유효성 isValidRegion), tagline(≤80 opt), story(opt), interview_video_url(opt url), hero_image_url(opt url), instagram_url/naver_place_url/kakao_channel_url(opt url), phone(opt), is_published(bool).
- `artworkSchema`: title(1~80), description(opt), price(int≥0 opt), price_tier(PRICE_TIERS opt), primary_image_url(opt url), match_tags 입력(style opt, mood/color/occasion/values = 콤마구분 문자열 → 배열 변환), is_published(bool).
- 매칭 태그 변환: 콤마구분 문자열 → `string[]`(trim·빈값 제거). 결과를 §3 구조 jsonb로 조립.

## 5. 정합성 자기점검 (코드 후 필수)
1. `lib/discovery.ts` 의 rpc 인자명 = §2 인자명과 **완전 일치**(p_category/p_mood/p_limit/p_offset 등).
2. 반환 타입 필드명 = RPC 반환 컬럼명과 1:1(드리프트 0).
3. admin insert/update의 컬럼명 = §1 실제 컬럼명과 일치(없는 컬럼 INSERT 금지).
4. match_tags.mood 는 배열로 저장(무드 필터 동작 전제).
5. admin 액션은 `requireAdmin()` 선행 + service-role 사용(컨시어지 NULL-owner 행 쓰기 가능).
6. 빌드 검증: Vercel 프리뷰(로컬 deps 없음). 실패 시 로그 확인·수정.
7. e2e: env 세팅·재배포 후 실제 클릭(발견→상세→작가→채널), admin 입력→게시→피드 반영.
