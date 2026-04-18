# Hidden Factory

공방 원장님의 마케팅·고객 소통을 자동화하는 B2B2C SaaS MVP.

- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Backend: Supabase (PostgreSQL · Auth · Storage)
- AI: Google Gemini 1.5 Flash

## 빠른 시작

```bash
pnpm install
cp .env.example .env.local      # 값 채우기
pnpm dev                        # http://localhost:3000
```

검증:

```bash
pnpm lint
pnpm build
```

## Supabase 마이그레이션 적용

```bash
pnpm dlx supabase@latest login
pnpm dlx supabase@latest link --project-ref <PROJECT_REF>
pnpm dlx supabase@latest db push
```

로컬 검증(Docker 필요):

```bash
pnpm dlx supabase@latest start
pnpm dlx supabase@latest db reset
```

## 환경 변수

`.env.example` 참고. `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY` 는 **서버 전용** —
`lib/supabase/admin.ts`, `lib/gemini.ts` 처럼 `import "server-only"` 가 붙은 모듈에서만 사용한다.

## 디렉터리

- `app/` — App Router 페이지/레이아웃
- `components/ui/` — shadcn/ui 기반 컴포넌트
- `lib/supabase/` — Supabase 클라이언트(`client` 브라우저용 / `server` SSR / `admin` 서비스 롤)
- `lib/gemini.ts` — Gemini 모델 헬퍼
- `lib/env.ts` — 환경 변수 안전 접근자
- `supabase/migrations/` — DB 마이그레이션 SQL
