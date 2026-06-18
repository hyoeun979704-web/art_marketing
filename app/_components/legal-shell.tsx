import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/app/_components/site-footer";

// 법무 문서 공통 셸. 본문은 출시 전 법률 검토·사업자정보 확정 필요(초안).
export function LegalShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Hidden&nbsp;Factory
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{title}</h1>
        <div className="flex flex-col gap-4 text-sm leading-relaxed text-foreground/90">
          {children}
        </div>
        <p className="mt-10 rounded-md border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
          ※ 본 문서는 초안입니다. 정식 시행 전 사업자정보 확정 및 법률 전문가 검토가 필요합니다.
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
