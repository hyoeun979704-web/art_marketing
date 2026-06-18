import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/app/_components/site-footer";
import { Button } from "@/components/ui/button";
import { getPublicArtwork } from "@/lib/discovery";
import { CATEGORY_LABELS } from "@/lib/schemas/onboarding";
import { formatPrice, tagList } from "@/lib/taste";

export default async function ArtworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const artwork = await getPublicArtwork(id);
  if (!artwork) notFound();

  const chips = [
    ...tagList(artwork.match_tags, "mood"),
    ...tagList(artwork.match_tags, "style"),
    ...tagList(artwork.match_tags, "occasion"),
  ].slice(0, 6);

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
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square w-full overflow-hidden rounded-xl border bg-muted">
            {artwork.primary_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artwork.primary_image_url}
                alt={artwork.title ?? "작품 이미지"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
                {CATEGORY_LABELS[artwork.category]}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <div className="text-sm text-muted-foreground">
                {CATEGORY_LABELS[artwork.category]}
                {artwork.region_sigungu ? ` · ${artwork.region_sigungu}` : ""}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">
                {artwork.title ?? "제목 미정"}
              </h1>
              <div className="text-lg font-semibold">
                {formatPrice(artwork.price, artwork.price_tier)}
              </div>
            </div>

            {artwork.artist_slug ? (
              <Link
                href={`/artist/${artwork.artist_slug}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                작가: {artwork.artist_name ?? "작가 보기"} →
              </Link>
            ) : null}

            {artwork.description ? (
              <p className="whitespace-pre-line text-sm leading-relaxed">
                {artwork.description}
              </p>
            ) : null}

            {chips.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                  >
                    #{c}
                  </span>
                ))}
              </div>
            ) : null}

            {artwork.artist_slug ? (
              <Button asChild className="mt-2 w-full sm:w-auto">
                <Link href={`/artist/${artwork.artist_slug}`}>
                  이 작가에게 문의·구매하기
                </Link>
              </Button>
            ) : null}
            <p className="text-xs text-muted-foreground">
              구매·문의는 작가의 판매 채널에서 진행됩니다(중개 서비스).
            </p>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
