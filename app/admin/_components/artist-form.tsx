"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { ImageUpload } from "@/app/admin/_components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSigunguList, SIDO_LIST } from "@/lib/data/korea-regions";
import { createArtist, updateArtist } from "@/app/admin/actions";
import { type ArtistInput } from "@/lib/schemas/admin";
import {
  CATEGORY_LABELS,
  STORE_CATEGORIES,
} from "@/lib/schemas/onboarding";

const EMPTY: ArtistInput = {
  name: "",
  slug: "",
  category: "OTHER",
  region_sido: "충청남도",
  region_sigungu: "천안시",
  tagline: "",
  story: "",
  interview_video_url: "",
  hero_image_url: "",
  instagram_url: "",
  naver_place_url: "",
  kakao_channel_url: "",
  phone: "",
  is_published: false,
};

export function ArtistForm({
  mode,
  storeId,
  defaultValues,
}: {
  mode: "create" | "edit";
  storeId?: string;
  defaultValues?: Partial<ArtistInput>;
}) {
  const router = useRouter();
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ArtistInput>({
    defaultValues: { ...EMPTY, ...defaultValues },
  });

  const sido = watch("region_sido");
  const heroUrl = watch("hero_image_url");

  async function onSubmit(values: ArtistInput) {
    setOkMsg(null);
    const res =
      mode === "create"
        ? await createArtist(values)
        : await updateArtist(storeId!, values);
    if ("error" in res) {
      setError("root", { message: res.error });
      return;
    }
    if (mode === "create" && res.id) {
      router.push(`/admin/artists/${res.id}`);
      return;
    }
    setOkMsg("저장되었습니다.");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Row label="작가/공방명" error={errors.name?.message}>
        <Input {...register("name")} placeholder="예: 흙과 손 도예공방" />
      </Row>

      <Row
        label="slug (공개 주소)"
        error={errors.slug?.message}
        hint="영문 소문자·숫자·하이픈. /artist/이값 으로 공개됩니다."
      >
        <Input {...register("slug")} placeholder="heuk-son" />
      </Row>

      <Row label="카테고리" error={errors.category?.message}>
        <select {...register("category")} className={selectCls}>
          {STORE_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </Row>

      <div className="grid grid-cols-2 gap-3">
        <Row label="시/도" error={errors.region_sido?.message}>
          <select {...register("region_sido")} className={selectCls}>
            {SIDO_LIST.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Row>
        <Row label="시/군/구" error={errors.region_sigungu?.message}>
          <select {...register("region_sigungu")} className={selectCls}>
            {getSigunguList(sido).map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Row>
      </div>

      <Row label="한 줄 소개" error={errors.tagline?.message}>
        <Input {...register("tagline")} placeholder="손으로 빚는 단 하나의 그릇" />
      </Row>

      <Row label="작가 서사(인터뷰 추출)" error={errors.story?.message}>
        <textarea {...register("story")} rows={6} className={textareaCls} />
      </Row>

      <Row
        label="인터뷰 영상 링크"
        error={errors.interview_video_url?.message}
        hint="유튜브 등 영상 URL"
      >
        <Input {...register("interview_video_url")} placeholder="https://" />
      </Row>

      <Row label="대표 이미지 URL" error={errors.hero_image_url?.message}>
        <Input {...register("hero_image_url")} placeholder="https://" />
      </Row>
      {mode === "edit" && storeId ? (
        <div className="flex items-center gap-3">
          <ImageUpload
            storeId={storeId}
            kind="hero"
            onUploaded={(url) =>
              setValue("hero_image_url", url, { shouldDirty: true })
            }
          />
          {heroUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroUrl}
              alt="대표 이미지 미리보기"
              className="h-16 w-16 rounded-md border object-cover"
            />
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          이미지 파일 업로드는 저장(생성) 후 수정 화면에서 가능합니다.
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Row label="인스타그램(구매·문의)" error={errors.instagram_url?.message}>
          <Input {...register("instagram_url")} placeholder="https://" />
        </Row>
        <Row label="네이버(구매·문의)" error={errors.naver_place_url?.message}>
          <Input {...register("naver_place_url")} placeholder="https://" />
        </Row>
        <Row label="카카오(구매·문의)" error={errors.kakao_channel_url?.message}>
          <Input {...register("kakao_channel_url")} placeholder="https://" />
        </Row>
      </div>

      <Row label="연락처(내부용·비공개)" error={errors.phone?.message}>
        <Input {...register("phone")} placeholder="010-..." />
      </Row>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("is_published")} />
        공개(게시) — 체크 시 소비자 발견 화면에 노출
      </label>

      {errors.root?.message ? (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      ) : null}
      {okMsg ? <p className="text-sm text-green-600">{okMsg}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중…" : mode === "create" ? "작가 생성" : "저장"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin")}
        >
          목록
        </Button>
      </div>
    </form>
  );
}

const selectCls =
  "h-9 w-full rounded-md border border-input bg-background px-3 text-sm";
const textareaCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm";

function Row({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
