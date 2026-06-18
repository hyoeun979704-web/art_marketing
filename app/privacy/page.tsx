import { LegalShell } from "@/app/_components/legal-shell";

export const metadata = { title: "개인정보처리방침 — Hidden Factory" };

export default function PrivacyPage() {
  return (
    <LegalShell title="개인정보처리방침">
      <p>
        Hidden Factory(이하 “서비스”)는 「개인정보 보호법」 등 관련 법령을 준수하며,
        이용자의 개인정보를 다음과 같이 처리합니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">1. 수집 항목 및 목적</h2>
      <ul className="list-disc pl-5">
        <li>작가(공방): 매장명·카테고리·지역·연락 채널(소개·연결 목적).</li>
        <li>인터뷰 참여 작가: 인터뷰 영상·음성(작가 소개 콘텐츠 제작 목적, 별도 활용 동의).</li>
        <li>문의 고객(해당 시): 연락처 등 최소 정보(문의 응대 목적).</li>
      </ul>

      <h2 className="mt-4 text-base font-semibold">2. 보유 및 이용 기간</h2>
      <p>
        수집 목적 달성 시 또는 정보주체의 삭제 요청 시 지체 없이 파기합니다.
        관계 법령에서 정한 기간이 있는 경우 그 기간 동안 보관합니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">3. 제3자 제공 및 처리위탁</h2>
      <p>
        법령에 근거하거나 정보주체의 동의가 있는 경우를 제외하고 개인정보를 제3자에게
        제공하지 않습니다. 서비스 운영을 위해 클라우드·인프라 제공자에게 처리를 위탁할 수 있으며,
        위탁 시 안전한 관리를 위한 조치를 취합니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">4. 정보주체의 권리</h2>
      <p>
        이용자는 본인 개인정보의 열람·정정·삭제·처리정지를 요청할 수 있습니다(개인정보 보호법 제35조 등).
        요청은 아래 연락처로 접수합니다.
      </p>

      <h2 className="mt-4 text-base font-semibold">5. 개인정보 보호책임자 / 사업자정보</h2>
      <p className="text-muted-foreground">
        (확정 예정) 상호·대표자·사업자등록번호·주소·연락처·이메일.
      </p>
    </LegalShell>
  );
}
