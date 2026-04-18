import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { Step1Category } from "./_components/step1-category";
import { Step2Details } from "./_components/step2-details";
import { Step3Review } from "./_components/step3-review";

type OnboardingStore = {
  id: string;
  name: string | null;
  category:
    | "RESIN"
    | "POTTERY"
    | "PAINTING"
    | "CALLIGRAPHY"
    | "GLASS"
    | "HANJI"
    | "OTHER";
  region_sido: string | null;
  region_sigungu: string | null;
  address_detail: string | null;
  tagline: string | null;
  phone: string | null;
  instagram_url: string | null;
  naver_place_url: string | null;
  kakao_channel_url: string | null;
  onboarding_step: number;
  onboarded_at: string | null;
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ step?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: storeRow } = await supabase
    .from("stores")
    .select(
      "id, name, category, region_sido, region_sigungu, address_detail, tagline, phone, instagram_url, naver_place_url, kakao_channel_url, onboarding_step, onboarded_at",
    )
    .eq("owner_user_id", user.id)
    .maybeSingle<OnboardingStore>();

  // 이미 완료한 유저는 대시보드로
  if (storeRow?.onboarded_at) {
    redirect("/dashboard");
  }

  const actualStep = storeRow?.onboarding_step ?? 1;
  const { step: stepParam } = await searchParams;
  const urlStepRaw = stepParam ? Number(stepParam) : actualStep;
  const urlStep =
    Number.isInteger(urlStepRaw) && urlStepRaw >= 1 && urlStepRaw <= 3
      ? urlStepRaw
      : actualStep;

  // URL ?step 은 actualStep 이하만 허용 (미래 스텝으로 건너뛰기 차단, 이전 스텝 수정은 허용)
  const effectiveStep = Math.min(urlStep, actualStep);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <OnboardingProgress current={effectiveStep} />
        {effectiveStep === 1 ? (
          <Step1Category
            defaultValues={{
              name: storeRow?.name ?? "",
              category: storeRow?.category ?? "OTHER",
            }}
          />
        ) : null}
        {effectiveStep === 2 ? (
          <Step2Details
            defaultValues={{
              region_sido: storeRow?.region_sido ?? "",
              region_sigungu: storeRow?.region_sigungu ?? "",
              address_detail: storeRow?.address_detail ?? "",
              tagline: storeRow?.tagline ?? "",
              phone: storeRow?.phone ?? "",
              instagram_url: storeRow?.instagram_url ?? "",
              naver_place_url: storeRow?.naver_place_url ?? "",
              kakao_channel_url: storeRow?.kakao_channel_url ?? "",
            }}
          />
        ) : null}
        {effectiveStep === 3 && storeRow ? (
          <Step3Review store={storeRow} />
        ) : null}
      </div>
    </main>
  );
}

function OnboardingProgress({ current }: { current: 1 | 2 | 3 | number }) {
  const labels = ["매장 기본", "상세 정보", "검토"];
  return (
    <ol className="flex items-center justify-between mb-6 text-xs">
      {labels.map((label, i) => {
        const step = i + 1;
        const active = step === current;
        const done = step < current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={
                "flex size-6 items-center justify-center rounded-full border text-[11px] font-medium " +
                (active
                  ? "border-primary bg-primary text-primary-foreground"
                  : done
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-muted text-muted-foreground")
              }
              aria-current={active ? "step" : undefined}
            >
              {step}
            </span>
            <span
              className={
                active
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }
            >
              {label}
            </span>
            {i < labels.length - 1 ? (
              <span className="flex-1 h-px bg-border mx-1" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
