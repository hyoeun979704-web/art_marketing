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

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: store } = await supabase
    .from("stores")
    .select("name, onboarded_at")
    .eq("owner_user_id", user.id)
    .maybeSingle();

  // 온보딩 미완료 → 온보딩으로
  if (!store || !store.onboarded_at) {
    redirect("/onboarding");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>환영합니다, {store.name}</CardTitle>
          <CardDescription>
            대시보드는 Phase 2에서 채워집니다. 조금만 기다려주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
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
