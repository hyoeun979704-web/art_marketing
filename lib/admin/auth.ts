import "server-only";

import { redirect } from "next/navigation";

import { optionalServerEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";

// 컨시어지 관리자 = 로그인 유저의 이메일이 ADMIN_EMAILS(콤마구분)에 포함된 경우.
function adminEmails(): string[] {
  return optionalServerEnv("ADMIN_EMAILS")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const allow = adminEmails();
  if (allow.length === 0) return null; // ADMIN_EMAILS 미설정 시 관리자 없음(안전 기본값)
  return allow.includes(user.email.toLowerCase()) ? user : null;
}

/** 서버 컴포넌트·서버 액션 양쪽에서 호출. 관리자 아니면 로그인으로. */
export async function requireAdmin() {
  const user = await getAdminUser();
  if (!user) redirect("/login");
  return user;
}
