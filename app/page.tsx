import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm flex flex-col gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Hidden Factory
          </h1>
          <p className="text-sm text-muted-foreground">
            공방 원장님을 위한 마케팅·고객 소통 자동화 SaaS
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link href="/signup">시작하기</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">로그인</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
