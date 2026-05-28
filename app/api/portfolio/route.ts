import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { defaultPortfolioContent, hydratePortfolioContent, PortfolioContent } from "@/lib/portfolio-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
  });
}

export async function GET() {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from("portfolio_content")
      .select("content")
      .eq("id", 1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ content: defaultPortfolioContent }, { status: 200 });
    }

    const hydrated = hydratePortfolioContent((data?.content ?? {}) as Partial<PortfolioContent>);
    return NextResponse.json({ content: hydrated }, { status: 200 });
  } catch {
    return NextResponse.json({ content: defaultPortfolioContent }, { status: 200 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("cms_session");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as { content?: Partial<PortfolioContent> };
    const safeContent = hydratePortfolioContent(body.content);
    const supabase = getSupabaseClient();

    const { error } = await supabase.from("portfolio_content").upsert(
      {
        id: 1,
        content: safeContent,
        updated_at: new Date().toISOString()
      },
      { onConflict: "id" }
    );

    if (error) {
      return NextResponse.json({ message: "Failed to save content." }, { status: 500 });
    }

    return NextResponse.json({ message: "Saved.", content: safeContent }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid request." }, { status: 400 });
  }
}
