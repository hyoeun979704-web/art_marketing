import { LegalShell } from "@/app/_components/legal-shell";

export const metadata = { title: "이용약관 — Hidden Factory" };

export default function TermsPage() {
  return (
    <LegalShell title="이용약관">
      <h2 className="text-base font-semibold">제1조 (목적)</h2>
      <p>
        본 약관은 Hidden Factory(이하 “서비스”)가 제공하는 공예 작가–이용자 연결(큐레이션·소개)
        서비스의 이용에 관한 조건과 절차를 규정합니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">제2조 (서비스의 성격)</h2>
      <p>
        서비스는 작가의 작품을 소개하고 이용자를 작가의 판매 채널로 <strong>연결</strong>하는
        <strong> 통신판매중개</strong> 서비스입니다. 작품의 거래·결제·배송·교환·환불은 원칙적으로
        해당 작가(판매자)와 이용자 간에 이루어지며, 서비스는 거래의 당사자가 아닙니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">제3조 (작가 콘텐츠)</h2>
      <p>
        작가의 인터뷰 영상·작품 사진·소개 정보는 작가의 동의를 받아 게시하며, 작가의 요청 또는
        제휴 종료 시 게시를 중단합니다. 작가는 본인이 권리를 가진 작품·이미지만 제공해야 합니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">제4조 (금지행위)</h2>
      <p>
        타인의 권리를 침해하는 콘텐츠, 허위·과장 정보, 법령 위반 행위를 금지합니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">제5조 (책임의 한계)</h2>
      <p>
        서비스는 중개자로서, 작가와 이용자 간 거래에 대해 법령이 정하는 범위 내에서 책임을 부담합니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">제6조 (문의)</h2>
      <p className="text-muted-foreground">(확정 예정) 운영자·연락처·시행일자.</p>
    </LegalShell>
  );
}
