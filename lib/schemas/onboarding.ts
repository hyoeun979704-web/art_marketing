import { z } from "zod";

import { isValidRegion, SIDO_LIST } from "@/lib/data/korea-regions";

export const STORE_CATEGORIES = [
  "RESIN",
  "POTTERY",
  "PAINTING",
  "CALLIGRAPHY",
  "GLASS",
  "HANJI",
  "OTHER",
] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<StoreCategory, string> = {
  RESIN: "레진",
  POTTERY: "도자기",
  PAINTING: "페인팅",
  CALLIGRAPHY: "캘리그라피",
  GLASS: "유리공예",
  HANJI: "한지공예",
  OTHER: "기타",
};

// Step 1: 매장명 + 카테고리
export const step1Schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "매장명을 입력해주세요")
    .max(50, "매장명은 50자 이내로 입력해주세요"),
  category: z.enum(STORE_CATEGORIES, {
    message: "카테고리를 선택해주세요",
  }),
});
export type Step1Input = z.infer<typeof step1Schema>;

// Step 2: 지역 + 상세주소 + 한 줄 소개 + (선택) 연락 채널
const optionalUrl = z
  .string()
  .trim()
  .max(500, "링크가 너무 깁니다")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v))
  .refine(
    (v) => v === undefined || /^https?:\/\/.+/i.test(v),
    "http(s):// 로 시작하는 링크를 입력해주세요",
  );

export const step2Schema = z
  .object({
    region_sido: z
      .string()
      .min(1, "시/도를 선택해주세요")
      .refine((v) => SIDO_LIST.includes(v), "지원하지 않는 시/도입니다"),
    region_sigungu: z.string().min(1, "시/군/구를 선택해주세요"),
    address_detail: z
      .string()
      .trim()
      .max(200, "상세주소는 200자 이내로 입력해주세요")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    tagline: z
      .string()
      .trim()
      .max(80, "한 줄 소개는 80자 이내로 입력해주세요")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    phone: z
      .string()
      .trim()
      .max(30, "전화번호가 너무 깁니다")
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : v)),
    instagram_url: optionalUrl,
    naver_place_url: optionalUrl,
    kakao_channel_url: optionalUrl,
  })
  .refine((d) => isValidRegion(d.region_sido, d.region_sigungu), {
    path: ["region_sigungu"],
    message: "지원하지 않는 시/군/구입니다",
  });
// Form 입력 타입 (transform 이전) vs 서버로 전달되는 파싱 후 타입 구분.
export type Step2Input = z.input<typeof step2Schema>;
export type Step2Output = z.output<typeof step2Schema>;
