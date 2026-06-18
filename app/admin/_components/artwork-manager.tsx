"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { ArtworkForm } from "@/app/admin/_components/artwork-form";
import { Button } from "@/components/ui/button";
import { setArtworkPublished } from "@/app/admin/actions";
import { type ArtworkInput } from "@/lib/schemas/admin";
import { formatPrice } from "@/lib/taste";

export type AdminArtwork = {
  id: string;
  title: string | null;
  price: number | null;
  price_tier: string | null;
  primary_image_url: string | null;
  match_tags: Record<string, unknown> | null;
  is_published: boolean;
};

function asCsv(v: unknown): string {
  if (Array.isArray(v)) return v.filter((x) => typeof x === "string").join(", ");
  return typeof v === "string" ? v : "";
}

function rowToInput(a: AdminArtwork): Partial<ArtworkInput> {
  const t = a.match_tags ?? {};
  return {
    title: a.title ?? "",
    price: a.price != null ? String(a.price) : "",
    price_tier: a.price_tier ?? "",
    primary_image_url: a.primary_image_url ?? "",
    style: typeof t.style === "string" ? t.style : "",
    mood: asCsv(t.mood),
    color: asCsv(t.color),
    occasion: asCsv(t.occasion),
    values: asCsv(t.values),
    is_published: a.is_published,
  };
}

export function ArtworkManager({
  storeId,
  artworks,
}: {
  storeId: string;
  artworks: AdminArtwork[];
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function togglePublish(a: AdminArtwork) {
    setBusyId(a.id);
    await setArtworkPublished(a.id, storeId, !a.is_published);
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">작품 ({artworks.length})</h2>
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          {adding ? "취소" : "새 작품 추가"}
        </Button>
      </div>

      {adding ? (
        <ArtworkForm
          storeId={storeId}
          mode="create"
          onDone={() => setAdding(false)}
        />
      ) : null}

      {artworks.length === 0 ? (
        <p className="text-sm text-muted-foreground">등록된 작품이 없습니다.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {artworks.map((a) => (
            <li key={a.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-muted">
                  {a.primary_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.primary_image_url}
                      alt={a.title ?? ""}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {a.title ?? "제목 미정"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatPrice(a.price, a.price_tier)} ·{" "}
                    {a.is_published ? "공개" : "비공개"}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busyId === a.id}
                    onClick={() => togglePublish(a)}
                  >
                    {a.is_published ? "비공개로" : "공개"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setEditingId((id) => (id === a.id ? null : a.id))
                    }
                  >
                    {editingId === a.id ? "닫기" : "수정"}
                  </Button>
                </div>
              </div>
              {editingId === a.id ? (
                <div className="mt-3">
                  <ArtworkForm
                    storeId={storeId}
                    mode="edit"
                    artworkId={a.id}
                    defaultValues={rowToInput(a)}
                    onDone={() => setEditingId(null)}
                  />
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
