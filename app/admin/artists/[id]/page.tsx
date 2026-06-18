import { notFound } from "next/navigation";

import { ArtistForm } from "@/app/admin/_components/artist-form";
import {
  ArtworkManager,
  type AdminArtwork,
} from "@/app/admin/_components/artwork-manager";
import { createAdminClient } from "@/lib/supabase/admin";
import { type ArtistInput } from "@/lib/schemas/admin";

export const dynamic = "force-dynamic";

function s(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: artist } = await admin
    .from("stores")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!artist) notFound();

  const { data: artworksData } = await admin
    .from("artworks")
    .select(
      "id,title,price,price_tier,primary_image_url,match_tags,is_published",
    )
    .eq("store_id", id)
    .order("created_at", { ascending: false });
  const artworks = (artworksData ?? []) as AdminArtwork[];

  const defaults: Partial<ArtistInput> = {
    name: s(artist.name),
    slug: s(artist.slug),
    category: artist.category,
    region_sido: s(artist.region_sido) || "충청남도",
    region_sigungu: s(artist.region_sigungu) || "천안시",
    tagline: s(artist.tagline),
    story: s(artist.story),
    interview_video_url: s(artist.interview_video_url),
    hero_image_url: s(artist.hero_image_url),
    instagram_url: s(artist.instagram_url),
    naver_place_url: s(artist.naver_place_url),
    kakao_channel_url: s(artist.kakao_channel_url),
    phone: s(artist.phone),
    is_published: !!artist.is_published,
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          작가 수정 — {s(artist.name) || "(이름 미정)"}
        </h1>
        <ArtistForm mode="edit" storeId={id} defaultValues={defaults} />
      </section>

      <section>
        <ArtworkManager storeId={id} artworks={artworks} />
      </section>
    </div>
  );
}
