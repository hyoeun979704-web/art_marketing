import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { StoreCategory } from "@/lib/schemas/onboarding";

// 공개 발견 데이터 레이어 — 0004 마이그레이션의 SECURITY DEFINER RPC 호출.
// 모든 RPC 는 is_published=true 행만, 공개 컬럼만 반환(전화 등 PII 비노출).

export type ArtworkCard = {
  artwork_id: string;
  title: string | null;
  price: number | null;
  price_tier: string | null;
  primary_image_url: string | null;
  match_tags: Record<string, unknown>;
  store_id: string;
  artist_name: string | null;
  artist_slug: string | null;
  category: StoreCategory;
  region_sido: string | null;
  region_sigungu: string | null;
};

export type ArtworkDetail = ArtworkCard & { description: string | null };

export type ArtistProfile = {
  store_id: string;
  slug: string;
  name: string | null;
  category: StoreCategory;
  region_sido: string | null;
  region_sigungu: string | null;
  tagline: string | null;
  story: string | null;
  interview_video_url: string | null;
  hero_image_url: string | null;
  instagram_url: string | null;
  naver_place_url: string | null;
  kakao_channel_url: string | null;
};

export type ArtistArtwork = {
  artwork_id: string;
  title: string | null;
  price: number | null;
  price_tier: string | null;
  primary_image_url: string | null;
  match_tags: Record<string, unknown>;
};

export async function discoverArtworks(params: {
  category?: StoreCategory | null;
  mood?: string | null;
  limit?: number;
  offset?: number;
}): Promise<ArtworkCard[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("discover_artworks", {
    p_category: params.category ?? null,
    p_mood: params.mood ?? null,
    p_limit: params.limit ?? 24,
    p_offset: params.offset ?? 0,
  });
  if (error) {
    console.error("[discoverArtworks]", error.message);
    return [];
  }
  return (data ?? []) as ArtworkCard[];
}

export async function getPublicArtwork(
  artworkId: string,
): Promise<ArtworkDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_artwork", {
    p_artwork_id: artworkId,
  });
  if (error) {
    console.error("[getPublicArtwork]", error.message);
    return null;
  }
  const row = (data ?? [])[0];
  return (row as ArtworkDetail) ?? null;
}

export async function getPublicArtist(
  slug: string,
): Promise<ArtistProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_artist", {
    p_slug: slug,
  });
  if (error) {
    console.error("[getPublicArtist]", error.message);
    return null;
  }
  const row = (data ?? [])[0];
  return (row as ArtistProfile) ?? null;
}

export async function getPublicArtistArtworks(
  slug: string,
): Promise<ArtistArtwork[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_artist_artworks", {
    p_slug: slug,
  });
  if (error) {
    console.error("[getPublicArtistArtworks]", error.message);
    return [];
  }
  return (data ?? []) as ArtistArtwork[];
}
