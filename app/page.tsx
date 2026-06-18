import Link from "next/link";
import { Suspense } from "react";

import { ArtworkCard } from "@/app/_components/artwork-card";
import { DiscoverFilters } from "@/app/_components/discover-filters";
import { SiteFooter } from "@/app/_components/site-footer";
import { discoverArtworks } from "@/lib/discovery";
import {
  STORE_CATEGORIES,
  type StoreCategory,
} from "@/lib/schemas/onboarding";

export const metadata = {
  title: "내가 찾던 예술 — 천안의 손끝",
  description:
    "천안 공예 작가들의 작품을 취향으로 발견하세요. 손으로 빚은 단 하나의 작품.",
};

function parseCategory(v: string | undefined): StoreCategory | null {
  return v && (STORE_CATEGORIES as readonly string[]).includes(v)
    ? (v as StoreCategory)
    : null;
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; mood?: string }>;
}) {
  const { category: rawCategory, mood: rawMood } = await searchParams;
  const category = parseCategory(rawCategory);
  const mood = rawMood?.trim() || null;

  const artworks = await discoverArtworks({ category, mood, limit: 36 });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Hidden&nbsp;Factory
          </Link>
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:underline"
          >
            작가·운영자
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <section className="mb-8 flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            내가 찾던 예술, 천안의 손끝에서
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            취향을 고르면, 그 결에 맞는 작가의 작품을 골라 보여드려요.
          </p>
        </section>

        <section className="mb-8">
          <Suspense fallback={<div className="h-16" />}>
            <DiscoverFilters />
          </Suspense>
        </section>

        {artworks.length === 0 ? (
          <div className="rounded-xl border border-dashed py-16 text-center text-sm text-muted-foreground">
            {category || mood
              ? "이 취향에 맞는 작품을 준비 중이에요. 다른 취향도 둘러보세요."
              : "곧 천안 작가들의 작품을 만나보실 수 있어요."}
          </div>
        ) : (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {artworks.map((a) => (
              <ArtworkCard
                key={a.artwork_id}
                artworkId={a.artwork_id}
                title={a.title}
                price={a.price}
                priceTier={a.price_tier}
                imageUrl={a.primary_image_url}
                matchTags={a.match_tags}
                category={a.category}
                artistName={a.artist_name}
                region={a.region_sigungu}
              />
            ))}
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
