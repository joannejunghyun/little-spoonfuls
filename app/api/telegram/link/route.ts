import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

const CODE_TTL_SECONDS = 600;
const CODE_LENGTH = 8;
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateCode(): string {
  const bytes = randomBytes(CODE_LENGTH);
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("telegram_links")
    .select("chat_id, linked_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const linked = !!(data?.chat_id && data?.linked_at);
  return NextResponse.json({
    linked,
    chat_id: linked ? String(data!.chat_id) : undefined,
  });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing, error: fetchError } = await supabase
    .from("telegram_links")
    .select("chat_id, link_code, code_expires_at, linked_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (fetchError) return NextResponse.json({ error: fetchError.message }, { status: 500 });

  if (existing?.chat_id && existing?.linked_at) {
    return NextResponse.json({ status: "already_linked" });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + CODE_TTL_SECONDS * 1000).toISOString();

  const { error: upsertError } = await supabase
    .from("telegram_links")
    .upsert(
      {
        user_id: user.id,
        link_code: code,
        code_expires_at: expiresAt,
        chat_id: null,
        linked_at: null,
      },
      { onConflict: "user_id" },
    );

  if (upsertError) return NextResponse.json({ error: upsertError.message }, { status: 500 });

  return NextResponse.json({
    code,
    expires_in: CODE_TTL_SECONDS,
    bot_username: process.env.TELEGRAM_BOT_USERNAME ?? null,
  });
}
