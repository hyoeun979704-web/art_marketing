import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CheckEmailPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>메일함을 확인해주세요</CardTitle>
        <CardDescription>
          입력하신 이메일로 인증 링크를 보냈습니다. 링크를 클릭하면 가입이
          완료되고 자동으로 로그인됩니다.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          메일이 도착하지 않았다면 스팸함도 확인해보세요. 몇 분이 지나도
          오지 않으면 이메일 주소를 다시 확인한 뒤 재가입해주세요.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href="/login">로그인 페이지로 이동</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
