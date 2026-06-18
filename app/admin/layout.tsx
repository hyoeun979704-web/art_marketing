import Link from "next/link";
import type { ReactNode } from "react";

import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await requireAdmin(); // 관리자 아니면 /login 으로

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/admin" className="text-lg font-semibold tracking-tight">
            Hidden Factory · 관리자
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            사이트 보기
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>
    </div>
  );
}
