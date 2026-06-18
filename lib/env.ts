type ServerEnvKey =
  | "SUPABASE_SERVICE_ROLE_KEY"
  | "GEMINI_API_KEY"
  | "ADMIN_EMAILS";
type PublicEnvKey = "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function read(key: string): string {
  const value = process.env[key];
  if (!value || value.length === 0) {
    throw new Error(
      `Missing ENV: ${key}. .env.local 을 확인하세요 (.env.example 참고).`,
    );
  }
  return value;
}

export function requireServerEnv(key: ServerEnvKey): string {
  return read(key);
}

export function requirePublicEnv(key: PublicEnvKey): string {
  return read(key);
}

/** 없으면 빈 문자열 반환(throw 안 함). 선택적 서버 설정용. */
export function optionalServerEnv(key: ServerEnvKey): string {
  return process.env[key] ?? "";
}
