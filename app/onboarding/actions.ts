"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  step1Schema,
  step2Schema,
  type Step1Input,
  type Step2Output,
} from "@/lib/schemas/onboarding";

type ActionResult = { error: string } | undefined;

const GENERIC_ERROR = "저장에 실패했습니다. 잠시 후 다시 시도해주세요";

async function getAuthedUserAndStore() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, store: null as null };

  const { data: store } = await supabase
    .from("stores")
    .select(
      "id, owner_user_id, name, category, region_sido, region_sigungu, address_detail, tagline, phone, instagram_url, naver_place_url, kakao_channel_url, onboarding_step, onboarded_at",
    )
    .eq("owner_user_id", user.id)
    .maybeSingle();

  return { supabase, user, store };
}

/**
 * Step 1 제출: 매장명 + 카테고리 → onboarding_step = max(current, 2)
 * - 기존 store 없으면 insert, 있으면 update.
 */
export async function submitStep1(input: Step1Input): Promise<ActionResult> {
  const parsed = step1Schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const { supabase, user, store } = await getAuthedUserAndStore();
  if (!user) redirect("/login");

  if (!store) {
    const { error } = await supabase.from("stores").insert({
      owner_user_id: user.id,
      name: parsed.data.name,
      category: parsed.data.category,
      onboarding_step: 2,
    });
    if (error) return { error: GENERIC_ERROR };
  } else {
    const nextStep = Math.max(store.onboarding_step, 2);
    const { error } = await supabase
      .from("stores")
      .update({
        name: parsed.data.name,
        category: parsed.data.category,
        onboarding_step: nextStep,
      })
      .eq("id", store.id);
    if (error) return { error: GENERIC_ERROR };
  }

  redirect("/onboarding?step=2");
}

/**
 * Step 2 제출: 지역 + 상세주소 + 한 줄 소개 + (선택) 연락 채널
 *  → onboarding_step = max(current, 3)
 */
export async function submitStep2(input: Step2Output): Promise<ActionResult> {
  const parsed = step2Schema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? GENERIC_ERROR };
  }

  const { supabase, user, store } = await getAuthedUserAndStore();
  if (!user) redirect("/login");
  if (!store) redirect("/onboarding?step=1");

  const nextStep = Math.max(store.onboarding_step, 3);
  const { error } = await supabase
    .from("stores")
    .update({
      region_sido: parsed.data.region_sido,
      region_sigungu: parsed.data.region_sigungu,
      address_detail: parsed.data.address_detail ?? null,
      tagline: parsed.data.tagline ?? null,
      phone: parsed.data.phone ?? null,
      instagram_url: parsed.data.instagram_url ?? null,
      naver_place_url: parsed.data.naver_place_url ?? null,
      kakao_channel_url: parsed.data.kakao_channel_url ?? null,
      onboarding_step: nextStep,
    })
    .eq("id", store.id);
  if (error) return { error: GENERIC_ERROR };

  redirect("/onboarding?step=3");
}

/**
 * Step 3 최종 확정: onboarded_at = now(). 대시보드 진입.
 */
export async function finishOnboarding(): Promise<ActionResult> {
  const { supabase, user, store } = await getAuthedUserAndStore();
  if (!user) redirect("/login");
  if (!store) redirect("/onboarding?step=1");

  // 누락된 필수 필드 안전 검증 (UI 우회 대비)
  if (!store.name || !store.region_sido || !store.region_sigungu) {
    return { error: "아직 입력하지 않은 필수 항목이 있습니다" };
  }

  const { error } = await supabase
    .from("stores")
    .update({
      onboarding_step: 3,
      onboarded_at: new Date().toISOString(),
    })
    .eq("id", store.id);
  if (error) return { error: GENERIC_ERROR };

  redirect("/dashboard");
}
