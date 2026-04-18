"use client";

import Link from "next/link";
import { useTransition } from "react";

import { finishOnboarding } from "@/app/onboarding/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/schemas/onboarding";

type Store = {
  name: string | null;
  category:
    | "RESIN"
    | "POTTERY"
    | "PAINTING"
    | "CALLIGRAPHY"
    | "GLASS"
    | "HANJI"
    | "OTHER";
  region_sido: string | null;
  region_sigungu: string | null;
  address_detail: string | null;
  tagline: string | null;
  phone: string | null;
  instagram_url: string | null;
  naver_place_url: string | null;
  kakao_channel_url: string | null;
};

export function Step3Review({ store }: { store: Store }) {
  const [isPending, startTransition] = useTransition();

  function onConfirm() {
    startTransition(async () => {
      await finishOnboarding();
    });
  }

  const region =
    store.region_sido && store.region_sigungu
      ? `${store.region_sido} ${store.region_sigungu}`
      : "—";

  return (
    <Card>
      <CardHeader>
        <CardTitle>입력 내용 확인</CardTitle>
        <CardDescription>
          아래 내용을 확인하고 시작해주세요. 완료 후에도 언제든 수정할 수
          있습니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="grid grid-cols-[88px_1fr] gap-y-2 text-sm">
          <Row label="매장명" value={store.name ?? "—"} />
          <Row label="분야" value={CATEGORY_LABELS[store.category]} />
          <Row label="지역" value={region} />
          <Row label="상세주소" value={store.address_detail ?? "—"} />
          <Row label="한 줄 소개" value={store.tagline ?? "—"} />
          <Row label="전화번호" value={store.phone ?? "—"} />
          <Row label="인스타그램" value={store.instagram_url ?? "—"} />
          <Row label="네이버 플레이스" value={store.naver_place_url ?? "—"} />
          <Row label="카카오 채널" value={store.kakao_channel_url ?? "—"} />
        </dl>

        <div className="flex flex-col gap-2">
          <Button
            type="button"
            className="w-full"
            disabled={isPending}
            onClick={onConfirm}
          >
            {isPending ? "확인 중…" : "시작하기"}
          </Button>
          <Button asChild type="button" variant="outline" className="w-full">
            <Link href="/onboarding?step=2">수정하기</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="break-all">{value}</dd>
    </>
  );
}
