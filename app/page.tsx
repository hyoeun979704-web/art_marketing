import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hidden Factory</CardTitle>
          <CardDescription>
            공방 원장님을 위한 마케팅·고객 자동화 SaaS — Phase 0 부트스트랩
            완료.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button>시작하기</Button>
          <Button variant="outline">문서</Button>
        </CardContent>
      </Card>
    </main>
  );
}
