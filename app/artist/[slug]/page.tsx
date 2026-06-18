import Link from "next/link";
import { notFound } from "next/navigation";

import { ArtworkCard } from "@/app/_components/artwork-card";
import { SiteFooter } from "@/app/_components/site-footer";
import { Button } from "@/components/ui/button";
import { getPublicArtist, getPublicArtistArtworks } from "@/lib/discovery";
import { CATEGORY_LABELS } from "@/lib/schemas/onboarding";

type Channel = { label: string; url: string | null };

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const artist = await getPublicArtist(slug);
  if (!artist) notFound();

  const artworks = await getPublicArtistArtworks(slug);

  const channels: Channel[] = [
    { label: "인스타그램", url: artist.instagram_url },
    { label: "네이버", url: artist.naver_place_url },
    { label: "카카오톡 문의", url: artist.kakao_channel_url },
  ].filter((c) => c.url) as Channel[];

  const region = [artist.region_sido, artist.region_sigungu]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Hidden&nbsp;Factory
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        {/* 작가 헤더 */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-full border bg-muted">
            {artist.hero_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artist.hero_image_url}
                alt={artist.name ?? "작가"}
                className="h-full w-full object-cover"
              />
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <div className="text-sm text-muted-foreground">
              {CATEGORY_LABELS[artist.category]}
              {region ? ` · ${region}` : ""}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {artist.name ?? "작가"}
            </h1>
            {artist.tagline ? (
              <p className="text-sm text-muted-foreground">{artist.tagline}</p>
            ) : null}
          </div>
        </section>

        {/* 인터뷰 영상 — 작가의 진짜 목소리(hero 자산) */}
        {artist.interview_video_url ? (
          <section className="mt-6">
            <Button asChild variant="outline">
              <a
                href={artist.interview_video_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                ▶ 작가 인터뷰 영상 보기
              </a>
            </Button>
          </section>
        ) : null}

        {/* 작가 서사 */}
        {artist.story ? (
          <section className="mt-6">
            <p className="whitespace-pre-line text-sm leading-relaxed">
              {artist.story}
            </p>
          </section>
        ) : null}

        {/* 리드젠 — 구매·문의는 작가 채널로 */}
        <section className="mt-6 flex flex-col gap-2">
          {channels.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {channels.map((c) => (
                <Button key={c.label} asChild>
                  <a href={c.url!} target="_blank" rel="noopener noreferrer">
                    {c.label}에서 구매·문의
                  </a>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              문의 채널을 준비 중이에요.
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            구매·결제·배송은 작가의 판매 채널에서 진행됩니다(중개 서비스).
          </p>
        </section>

        {/* 작품 */}
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">작품</h2>
          {artworks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              곧 작품을 만나보실 수 있어요.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {artworks.map((a) => (
                <ArtworkCard
                  key={a.artwork_id}
                  artworkId={a.artwork_id}
                  title={a.title}
                  price={a.price}
                  priceTier={a.price_tier}
                  imageUrl={a.primary_image_url}
                  matchTags={a.match_tags}
                  category={artist.category}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
