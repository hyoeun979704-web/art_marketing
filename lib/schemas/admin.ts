import { z } from "zod";

import { isValidRegion, SIDO_LIST } from "@/lib/data/korea-regions";
import { STORE_CATEGORIES } from "@/lib/schemas/onboarding";
import { PRICE_TIERS } from "@/lib/taste";

const optText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `${max}자 이내로 입력해주세요`)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v));

const optUrl = z
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

// ── 작가(stores) ─────────────────────────────────────────────────────────
export const artistSchema = z
  .object({
    name: z.string().trim().min(1, "작가/공방명을 입력해주세요").max(50),
    slug: z
      .string()
      .trim()
      .regex(/^[a-z0-9-]{2,40}$/, "영문 소문자·숫자·하이픈 2~40자 (예: kim-doja)"),
    category: z.enum(STORE_CATEGORIES, { message: "카테고리를 선택해주세요" }),
    region_sido: z
      .string()
      .min(1, "시/도를 선택해주세요")
      .refine((v) => SIDO_LIST.includes(v), "지원하지 않는 시/도입니다"),
    region_sigungu: z.string().min(1, "시/군/구를 선택해주세요"),
    tagline: optText(80),
    story: optText(4000),
    interview_video_url: optUrl,
    hero_image_url: optUrl,
    instagram_url: optUrl,
    naver_place_url: optUrl,
    kakao_channel_url: optUrl,
    phone: optText(30),
    is_published: z.boolean().default(false),
  })
  .refine((d) => isValidRegion(d.region_sido, d.region_sigungu), {
    path: ["region_sigungu"],
    message: "지원하지 않는 시/군/구입니다",
  });

export type ArtistInput = z.input<typeof artistSchema>;
export type ArtistData = z.output<typeof artistSchema>;

// ── 작품(artworks) ───────────────────────────────────────────────────────
export const artworkSchema = z.object({
  title: z.string().trim().min(1, "작품명을 입력해주세요").max(80),
  description: optText(4000),
  price: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => {
      if (!v) return undefined;
      const n = Number(v.replace(/[, ]/g, ""));
      return Number.isFinite(n) ? Math.trunc(n) : undefined;
    })
    .refine((v) => v === undefined || (v >= 0 && v <= 100_000_000), "0 이상의 금액"),
  price_tier: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : undefined))
    .refine(
      (v) => v === undefined || (PRICE_TIERS as readonly string[]).includes(v),
      "가격대를 선택해주세요",
    ),
  primary_image_url: optUrl,
  // match_tags 입력 — 콤마구분 문자열(서버에서 배열로 변환)
  style: optText(40),
  mood: optText(200),
  color: optText(200),
  occasion: optText(200),
  values: optText(200),
  is_published: z.boolean().default(false),
});

export type ArtworkInput = z.input<typeof artworkSchema>;
export type ArtworkData = z.output<typeof artworkSchema>;

// 콤마구분 문자열 → 정리된 배열
export function splitList(s: string | undefined): string[] {
  return (s ?? "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

// match_tags(jsonb) 조립 — docs/dev-contracts.md §3 구조
export function buildMatchTags(d: ArtworkData): Record<string, unknown> {
  const t: Record<string, unknown> = {};
  if (d.style) t.style = d.style;
  const mood = splitList(d.mood);
  if (mood.length) t.mood = mood;
  const color = splitList(d.color);
  if (color.length) t.color = color;
  const occasion = splitList(d.occasion);
  if (occasion.length) t.occasion = occasion;
  const values = splitList(d.values);
  if (values.length) t.values = values;
  if (d.price_tier) t.price_tier = d.price_tier;
  return t;
}
