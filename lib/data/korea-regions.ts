// 한국 행정구역 데이터 — Phase 1-b 는 "충청남도 천안시" 만 지원.
// 추후 확장 시 아래 배열에 { sido, sigungu[] } 를 추가하면 된다.

export type KoreaRegion = {
  sido: string;
  sigungu: string[];
};

export const KOREA_REGIONS: readonly KoreaRegion[] = [
  {
    sido: "충청남도",
    sigungu: ["천안시"],
  },
] as const;

export const SIDO_LIST: readonly string[] = KOREA_REGIONS.map((r) => r.sido);

export function getSigunguList(sido: string): readonly string[] {
  return KOREA_REGIONS.find((r) => r.sido === sido)?.sigungu ?? [];
}

export function isValidRegion(sido: string, sigungu: string): boolean {
  return getSigunguList(sido).includes(sigungu);
}
