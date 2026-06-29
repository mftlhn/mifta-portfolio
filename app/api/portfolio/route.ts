import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAuthenticated } from "@/lib/auth";
import {
  defaultPortfolioContent,
  hydratePortfolioContent,
  PortfolioContent,
} from "@/lib/portfolio-data";

// ===========================
// GET
// ===========================
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("portfolio_content")
      .select("content")
      .eq("id", 1)
      .single();

    if (error) {
      console.error("GET Portfolio Error:", error);

      return NextResponse.json(
        {
          message: error.message,
          content: defaultPortfolioContent,
        },
        { status: 500 }
      );
    }

    const hydrated = hydratePortfolioContent(
      (data?.content ?? {}) as Partial<PortfolioContent>
    );

    return NextResponse.json({
      success: true,
      content: hydrated,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        content: defaultPortfolioContent,
      },
      { status: 500 }
    );
  }
}

// ===========================
// PUT
// ===========================
export async function PUT(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const body = await request.json();

    const safeContent = hydratePortfolioContent(body.content);

    const { error } = await supabase
      .from("portfolio_content")
      .upsert(
        {
          id: 1,
          content: safeContent,
        },
        {
          onConflict: "id",
        }
      );

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          message: error.message,
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      content: safeContent,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}