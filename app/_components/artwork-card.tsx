import Link from "next/link";

import { CATEGORY_LABELS, type StoreCategory } from "@/lib/schemas/onboarding";
import { formatPrice, tagList } from "@/lib/taste";

type Props = {
  artworkId: string;
  title: string | null;
  price: number | null;
  priceTier: string | null;
  imageUrl: string | null;
  matchTags: unknown;
  category: StoreCategory;
  artistName?: string | null;
  region?: string | null;
};

export function ArtworkCard({
  artworkId,
  title,
  price,
  priceTier,
  imageUrl,
  matchTags,
  category,
  artistName,
  region,
}: Props) {
  const moods = tagList(matchTags, "mood").slice(0, 2);
  return (
    <Link
      href={`/artwork/${artworkId}`}
      className="group flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="aspect-square w-full overflow-hidden bg-muted">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title ?? "작품 이미지"}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            {CATEGORY_LABELS[category]}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>{CATEGORY_LABELS[category]}</span>
          {artistName ? <span>· {artistName}</span> : null}
        </div>
        <h3 className="line-clamp-1 text-sm font-medium">
          {title ?? "제목 미정"}
        </h3>
        <div className="mt-0.5 flex items-center justify-between">
          <span className="text-sm font-semibold">
            {formatPrice(price, priceTier)}
          </span>
          {region ? (
            <span className="text-xs text-muted-foreground">{region}</span>
          ) : null}
        </div>
        {moods.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {moods.map((m) => (
              <span
                key={m}
                className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
              >
                #{m}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
