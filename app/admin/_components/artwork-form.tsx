"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";

import { ImageUpload } from "@/app/admin/_components/image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createArtwork, updateArtwork } from "@/app/admin/actions";
import { type ArtworkInput } from "@/lib/schemas/admin";
import { MOODS, PRICE_TIERS } from "@/lib/taste";

const EMPTY: ArtworkInput = {
  title: "",
  description: "",
  price: "",
  price_tier: "",
  primary_image_url: "",
  style: "",
  mood: "",
  color: "",
  occasion: "",
  values: "",
  is_published: false,
};

export function ArtworkForm({
  storeId,
  mode,
  artworkId,
  defaultValues,
  onDone,
}: {
  storeId: string;
  mode: "create" | "edit";
  artworkId?: string;
  defaultValues?: Partial<ArtworkInput>;
  onDone?: () => void;
}) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ArtworkInput>({ defaultValues: { ...EMPTY, ...defaultValues } });

  const imageUrl = watch("primary_image_url");

  async function onSubmit(values: ArtworkInput) {
    const res =
      mode === "create"
        ? await createArtwork(storeId, values)
        : await updateArtwork(artworkId!, storeId, values);
    if ("error" in res) {
      setError("root", { message: res.error });
      return;
    }
    if (mode === "create") reset(EMPTY);
    onDone?.();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-3 rounded-lg border p-4"
      noValidate
    >
      <Row label="작품명" error={errors.title?.message}>
        <Input {...register("title")} placeholder="예: 크림 머그" />
      </Row>

      <Row label="설명" error={errors.description?.message}>
        <textarea {...register("description")} rows={3} className={textareaCls} />
      </Row>

      <div className="grid grid-cols-2 gap-3">
        <Row label="가격(원, 비우면 가격문의)" error={errors.price?.message}>
          <Input {...register("price")} inputMode="numeric" placeholder="32000" />
        </Row>
        <Row label="가격대" error={errors.price_tier?.message}>
          <select {...register("price_tier")} className={selectCls}>
            <option value="">선택 안 함</option>
            {PRICE_TIERS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </Row>
      </div>

      <Row label="대표 이미지 URL" error={errors.primary_image_url?.message}>
        <Input {...register("primary_image_url")} placeholder="https://" />
      </Row>
      <div className="flex items-center gap-3">
        <ImageUpload
          storeId={storeId}
          kind="artwork"
          onUploaded={(url) =>
            setValue("primary_image_url", url, { shouldDirty: true })
          }
        />
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="미리보기"
            className="h-16 w-16 rounded-md border object-cover"
          />
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Row label="스타일(단일)" error={errors.style?.message}>
          <Input {...register("style")} placeholder="내추럴" />
        </Row>
        <Row
          label="무드(콤마 구분)"
          hint={`예: ${MOODS.slice(0, 3)
            .map((m) => m.value)
            .join(", ")}`}
          error={errors.mood?.message}
        >
          <Input {...register("mood")} placeholder="따뜻, 차분" />
        </Row>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Row label="색감(콤마)" error={errors.color?.message}>
          <Input {...register("color")} placeholder="크림, 청록" />
        </Row>
        <Row label="용도/계기(콤마)" error={errors.occasion?.message}>
          <Input {...register("occasion")} placeholder="집들이, 선물" />
        </Row>
        <Row label="가치(콤마)" error={errors.values?.message}>
          <Input {...register("values")} placeholder="수제, 로컬" />
        </Row>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("is_published")} />
        공개(게시)
      </label>

      {errors.root?.message ? (
        <p className="text-sm text-destructive">{errors.root.message}</p>
      ) : null}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? "저장 중…" : mode === "create" ? "작품 추가" : "저장"}
        </Button>
        {onDone ? (
          <Button type="button" size="sm" variant="outline" onClick={onDone}>
            닫기
          </Button>
        ) : null}
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
