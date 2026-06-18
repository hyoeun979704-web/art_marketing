import Link from "next/link";

import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { CATEGORY_LABELS, type StoreCategory } from "@/lib/schemas/onboarding";

export const dynamic = "force-dynamic";

type StoreRow = {
  id: string;
  name: string | null;
  slug: string | null;
  category: StoreCategory;
  is_published: boolean;
};

export default async function AdminHome() {
  const admin = createAdminClient();
  const { data: storesData } = await admin
    .from("stores")
    .select("id,name,slug,category,is_published")
    .order("created_at", { ascending: false });
  const stores = (storesData ?? []) as StoreRow[];

  const { data: artworkRows } = await admin.from("artworks").select("store_id");
  const counts = new Map<string, number>();
  for (const r of (artworkRows ?? []) as { store_id: string }[]) {
    counts.set(r.store_id, (counts.get(r.store_id) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">작가 관리</h1>
        <Button asChild>
          <Link href="/admin/artists/new">새 작가</Link>
        </Button>
      </div>

      {stores.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          등록된 작가가 없습니다. “새 작가”로 첫 작가를 등록하세요.
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {stores.map((s) => (
            <li key={s.id}>
              <Link
                href={`/admin/artists/${s.id}`}
                className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="truncate font-medium">
                    {s.name ?? "(이름 미정)"}{" "}
                    <span className="text-xs text-muted-foreground">
                      /{s.slug ?? "—"}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {CATEGORY_LABELS[s.category]} · 작품 {counts.get(s.id) ?? 0}개
                  </div>
                </div>
                <span
                  className={
                    s.is_published
                      ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                      : "rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  }
                >
                  {s.is_published ? "공개" : "비공개"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
