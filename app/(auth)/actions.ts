"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, signupSchema } from "@/lib/validation/auth";

const GENERIC_SIGNIN_ERROR = "이메일 또는 비밀번호가 일치하지 않습니다";
const GENERIC_SIGNUP_ERROR = "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요";

type ActionResult = { error: string } | undefined;

export async function signInAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: GENERIC_SIGNIN_ERROR };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) {
    return { error: GENERIC_SIGNIN_ERROR };
  }

  redirect("/onboarding");
}

export async function signUpAction(input: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);
  if (!parsed.success) {
    return { error: GENERIC_SIGNUP_ERROR };
  }

  const origin = (await headers()).get("origin") ?? "";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });

  if (error) {
    return { error: GENERIC_SIGNUP_ERROR };
  }

  if (data.session) {
    redirect("/onboarding");
  }

  redirect("/signup/check-email");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
