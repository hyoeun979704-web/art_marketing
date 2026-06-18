import Link from "next/link";

// 공통 푸터 — 법무 페이지 링크는 출시 필수(개인정보·이용약관·중개 고지).
export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Hidden Factory</p>
        <p>천안의 손끝을 잇는 공예 큐레이션 — 천안공예협회와 함께합니다.</p>
        <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <Link href="/privacy" className="hover:underline">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="hover:underline">
            이용약관
          </Link>
          <Link href="/intermediary" className="hover:underline">
            통신판매중개 안내
          </Link>
        </nav>
        <p className="mt-2 text-xs">
          본 서비스는 작품 구매·문의를 작가의 판매 채널로 연결하는 중개 서비스입니다.
        </p>
      </div>
    </footer>
  );
}
