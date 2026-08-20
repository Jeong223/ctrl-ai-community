export class SupabaseConfigurationError extends Error {
  constructor() {
    super("Supabase 환경변수가 설정되지 않았습니다.");
    this.name = "SupabaseConfigurationError";
  }
}

function required(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new SupabaseConfigurationError();
  return value;
}

export function getPublicSupabaseConfig() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    anonKey: required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  };
}

export function getAdminSupabaseConfig() {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL"),
    serviceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  };
}
