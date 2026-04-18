import { redirect } from "next/navigation";

import { signOutAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Hidden Factory에 오신 것을 환영합니다</CardTitle>
          <CardDescription>
            매장 온보딩 화면은 Phase 1-b에서 구현됩니다. 조금만 기다려주세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground break-all">
            로그인 계정: {user.email}
          </p>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full">
              로그아웃
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
