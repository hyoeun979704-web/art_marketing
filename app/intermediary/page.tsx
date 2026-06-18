import { LegalShell } from "@/app/_components/legal-shell";

export const metadata = { title: "통신판매중개 안내 — Hidden Factory" };

export default function IntermediaryPage() {
  return (
    <LegalShell title="통신판매중개 안내">
      <p>
        Hidden Factory는 공예 작가의 작품을 소개하고 이용자를 작가의 판매 채널로 연결하는
        <strong> 통신판매중개자</strong>이며, <strong>통신판매의 당사자가 아닙니다.</strong>
      </p>
      <p>
        따라서 개별 작품의 거래·결제·배송·교환·환불 등 거래에 관한 의무와 책임은 원칙적으로
        해당 작품을 판매하는 <strong>작가(판매자)</strong>에게 있습니다. 이용자는 구매 전 작가의
        판매 채널에서 거래 조건(가격·배송·환불 정책 등)을 확인하시기 바랍니다.
      </p>
      <h2 className="mt-4 text-base font-semibold">중개자 정보</h2>
      <p className="text-muted-foreground">
        (확정 예정) 상호·대표자·사업자등록번호·통신판매중개업 신고번호·주소·연락처.
      </p>
      <h2 className="mt-4 text-base font-semibold">분쟁 처리</h2>
      <p>
        거래 관련 분쟁이 발생한 경우 작가와 이용자 간 협의를 우선하며, 서비스는 원활한 해결을 위해
        필요한 정보 제공 등 합리적인 노력을 다합니다.
      </p>
    </LegalShell>
  );
}
