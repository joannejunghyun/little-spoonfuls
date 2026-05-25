import { NextRequest, NextResponse } from "next/server";
import { createClient as createPhoenixClient } from "@arizeai/phoenix-client";
import { createClient } from "@/lib/supabase/server";

const phoenix = createPhoenixClient();

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { trace_id, meal_name } = await req.json();
  if (!trace_id) {
    return NextResponse.json({ error: "trace_id required" }, { status: 400 });
  }

  const { error } = await phoenix.POST("/v1/trace_annotations", {
    body: {
      data: [
        {
          trace_id,
          name: "user_saved",
          annotator_kind: "HUMAN",
          result: {
            label: "saved",
            score: 1,
            explanation: meal_name ? `User saved: ${meal_name}` : "User saved meal",
          },
        },
      ],
    },
  });

  if (error) {
    console.error("[Arize] trace annotation failed:", error);
    return NextResponse.json({ error: "annotation failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
