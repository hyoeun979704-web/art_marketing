"use client";

import { useState, type ChangeEvent } from "react";

import { uploadImage } from "@/app/admin/actions";

export function ImageUpload({
  storeId,
  kind,
  onUploaded,
}: {
  storeId: string;
  kind: "hero" | "artwork";
  onUploaded: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("storeId", storeId);
    fd.set("kind", kind);
    const res = await uploadImage(fd);
    setBusy(false);
    e.target.value = "";
    if ("error" in res) {
      setErr(res.error);
      return;
    }
    if (res.url) onUploaded(res.url);
  }

  return (
    <div className="flex flex-col gap-1">
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        disabled={busy}
        className="text-sm"
      />
      {busy ? (
        <span className="text-xs text-muted-foreground">업로드 중…</span>
      ) : null}
      {err ? <span className="text-xs text-destructive">{err}</span> : null}
    </div>
  );
}
