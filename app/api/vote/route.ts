import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VOTE_TARGET = 50;

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ count }, { data: myVote }] = await Promise.all([
    supabase.from("votes").select("*", { count: "exact", head: true }),
    supabase.from("votes").select("id").eq("user_id", user.id).maybeSingle(),
  ]);

  return NextResponse.json({
    count: count ?? 0,
    target: VOTE_TARGET,
    hasVoted: !!myVote,
  });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase.from("votes").insert({ user_id: user.id });

  // Unique constraint violation = already voted — treat as success
  if (error && !error.message.includes("duplicate") && !error.code?.includes("23505")) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { count } = await supabase.from("votes").select("*", { count: "exact", head: true });

  return NextResponse.json({
    count: count ?? 0,
    target: VOTE_TARGET,
    hasVoted: true,
  });
}
