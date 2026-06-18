"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { CATEGORY_LABELS, STORE_CATEGORIES } from "@/lib/schemas/onboarding";
import { MOODS } from "@/lib/taste";

// 가벼운 취향 필터 — 카테고리/무드 택1. 선택은 URL searchParams 로 반영되어
// 서버 컴포넌트(page)가 재조회한다(계정 없이 동작).
export function DiscoverFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const activeCategory = params.get("category");
  const activeMood = params.get("mood");

  const toggle = useCallback(
    (key: "category" | "mood", value: string) => {
      const next = new URLSearchParams(params.toString());
      if (next.get(key) === value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      const qs = next.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [params, pathname, router],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {STORE_CATEGORIES.map((c) => (
          <Chip
            key={c}
            active={activeCategory === c}
            onClick={() => toggle("category", c)}
          >
            {CATEGORY_LABELS[c]}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {MOODS.map((m) => (
          <Chip
            key={m.value}
            active={activeMood === m.value}
            onClick={() => toggle("mood", m.value)}
          >
            {m.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1 text-sm transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </button>
  );
}
