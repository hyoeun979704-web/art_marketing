// 큐레이션/취향 공용 상수 — docs/curation-matching.md §3 매칭 속성 택소노미와 정렬.
// match_tags(jsonb) 의 mood/style 값은 한국어 토큰으로 저장한다(예: "따뜻").

export const MOODS = [
  { value: "따뜻", label: "따뜻한" },
  { value: "차분", label: "차분한" },
  { value: "내추럴", label: "내추럴" },
  { value: "화사", label: "화사한" },
  { value: "시크", label: "시크한" },
  { value: "러스틱", label: "러스틱" },
] as const;

export type MoodValue = (typeof MOODS)[number]["value"];

export const PRICE_TIERS = ["1-5만", "5-15만", "15만+"] as const;

/** match_tags(jsonb) 에서 안전하게 문자열 배열을 꺼낸다. */
export function tagList(
  matchTags: unknown,
  key: "mood" | "style" | "color" | "occasion" | "values",
): string[] {
  if (!matchTags || typeof matchTags !== "object") return [];
  const v = (matchTags as Record<string, unknown>)[key];
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string") return [v];
  return [];
}

/** 가격 표시: 숫자 있으면 "12,000원", 없으면 tier, 둘 다 없으면 "가격 문의". */
export function formatPrice(
  price: number | null | undefined,
  priceTier: string | null | undefined,
): string {
  if (typeof price === "number" && price > 0) return `${price.toLocaleString("ko-KR")}원`;
  if (priceTier) return priceTier;
  return "가격 문의";
}
