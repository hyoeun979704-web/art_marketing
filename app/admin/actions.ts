"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  artistSchema,
  artworkSchema,
  buildMatchTags,
  type ArtistData,
  type ArtworkData,
} from "@/lib/schemas/admin";

type Result = { ok: true; id?: string; url?: string } | { error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function nowIfPublished(isPublished: boolean): string | null {
  return isPublished ? new Date().toISOString() : null;
}

function toStoreRow(d: ArtistData) {
  return {
    name: d.name,
    slug: d.slug,
    category: d.category,
    region_sido: d.region_sido,
    region_sigungu: d.region_sigungu,
    tagline: d.tagline ?? null,
    story: d.story ?? null,
    interview_video_url: d.interview_video_url ?? null,
    hero_image_url: d.hero_image_url ?? null,
    instagram_url: d.instagram_url ?? null,
    naver_place_url: d.naver_place_url ?? null,
    kakao_channel_url: d.kakao_channel_url ?? null,
    phone: d.phone ?? null,
    is_published: d.is_published,
    published_at: nowIfPublished(d.is_published),
  };
}

function toArtworkRow(d: ArtworkData) {
  return {
    title: d.title,
    description: d.description ?? null,
    price: d.price ?? null,
    price_tier: d.price_tier ?? null,
    primary_image_url: d.primary_image_url ?? null,
    match_tags: buildMatchTags(d),
    is_published: d.is_published,
    published_at: nowIfPublished(d.is_published),
  };
}

function friendlyDbError(message: string): string {
  if (/duplicate key|unique/i.test(message)) {
    return "이미 사용 중인 slug 입니다. 다른 값을 입력해주세요.";
  }
  return "저장 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.";
}

// ── 작가 ───────────────────────────────────────────────────────────────
export async function createArtist(input: unknown): Promise<Result> {
  await requireAdmin();
  const parsed = artistSchema.safeParse(input);
  if (!parsed.success) return { error: "입력값을 확인해주세요." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("stores")
    .insert({ ...toStoreRow(parsed.data), owner_user_id: null })
    .select("id")
    .single();
  if (error) {
    console.error("[createArtist]", error.message);
    return { error: friendlyDbError(error.message) };
  }
  revalidatePath("/admin");
  return { ok: true, id: data.id as string };
}

export async function updateArtist(
  id: string,
  input: unknown,
): Promise<Result> {
  await requireAdmin();
  if (!UUID_RE.test(id)) return { error: "잘못된 작가 ID 입니다." };
  const parsed = artistSchema.safeParse(input);
  if (!parsed.success) return { error: "입력값을 확인해주세요." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("stores")
    .update(toStoreRow(parsed.data))
    .eq("id", id);
  if (error) {
    console.error("[updateArtist]", error.message);
    return { error: friendlyDbError(error.message) };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/artists/${id}`);
  return { ok: true, id };
}

export async function setArtistPublished(
  id: string,
  published: boolean,
): Promise<Result> {
  await requireAdmin();
  if (!UUID_RE.test(id)) return { error: "잘못된 작가 ID 입니다." };
  const admin = createAdminClient();
  const { error } = await admin
    .from("stores")
    .update({ is_published: published, published_at: nowIfPublished(published) })
    .eq("id", id);
  if (error) {
    console.error("[setArtistPublished]", error.message);
    return { error: "상태 변경에 실패했습니다." };
  }
  revalidatePath("/admin");
  revalidatePath(`/admin/artists/${id}`);
  return { ok: true, id };
}

// ── 작품 ───────────────────────────────────────────────────────────────
export async function createArtwork(
  storeId: string,
  input: unknown,
): Promise<Result> {
  await requireAdmin();
  if (!UUID_RE.test(storeId)) return { error: "잘못된 작가 ID 입니다." };
  const parsed = artworkSchema.safeParse(input);
  if (!parsed.success) return { error: "입력값을 확인해주세요." };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("artworks")
    .insert({ ...toArtworkRow(parsed.data), store_id: storeId })
    .select("id")
    .single();
  if (error) {
    console.error("[createArtwork]", error.message);
    return { error: "작품 저장에 실패했습니다." };
  }
  revalidatePath(`/admin/artists/${storeId}`);
  return { ok: true, id: data.id as string };
}

export async function updateArtwork(
  id: string,
  storeId: string,
  input: unknown,
): Promise<Result> {
  await requireAdmin();
  if (!UUID_RE.test(id) || !UUID_RE.test(storeId)) {
    return { error: "잘못된 ID 입니다." };
  }
  const parsed = artworkSchema.safeParse(input);
  if (!parsed.success) return { error: "입력값을 확인해주세요." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("artworks")
    .update(toArtworkRow(parsed.data))
    .eq("id", id);
  if (error) {
    console.error("[updateArtwork]", error.message);
    return { error: "작품 저장에 실패했습니다." };
  }
  revalidatePath(`/admin/artists/${storeId}`);
  return { ok: true, id };
}

export async function setArtworkPublished(
  id: string,
  storeId: string,
  published: boolean,
): Promise<Result> {
  await requireAdmin();
  if (!UUID_RE.test(id) || !UUID_RE.test(storeId)) {
    return { error: "잘못된 ID 입니다." };
  }
  const admin = createAdminClient();
  const { error } = await admin
    .from("artworks")
    .update({ is_published: published, published_at: nowIfPublished(published) })
    .eq("id", id);
  if (error) {
    console.error("[setArtworkPublished]", error.message);
    return { error: "상태 변경에 실패했습니다." };
  }
  revalidatePath(`/admin/artists/${storeId}`);
  return { ok: true, id };
}

// ── 이미지 업로드 (service-role → store-assets 공개 버킷) ──────────────────
export async function uploadImage(formData: FormData): Promise<Result> {
  await requireAdmin();
  const file = formData.get("file");
  const storeId = String(formData.get("storeId") ?? "");
  const kind = String(formData.get("kind") ?? "img");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "파일을 선택해주세요." };
  }
  if (!UUID_RE.test(storeId)) return { error: "작가를 먼저 저장해주세요." };
  if (file.size > 10 * 1024 * 1024) return { error: "10MB 이하 이미지만 가능합니다." };
  if (!file.type.startsWith("image/")) return { error: "이미지 파일만 가능합니다." };

  const ext = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `concierge/${storeId}/${kind}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext || "jpg"}`;

  const admin = createAdminClient();
  const { error } = await admin.storage
    .from("store-assets")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("[uploadImage]", error.message);
    return { error: "업로드에 실패했습니다." };
  }
  const { data } = admin.storage.from("store-assets").getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
