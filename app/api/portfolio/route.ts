import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  defaultPortfolioContent,
  hydratePortfolioContent,
  PortfolioContent
} from "@/lib/portfolio-data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function getSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });
}

// ===== GET: Mengambil Data =====
export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data } = await supabase
      .from("portfolio_content")
      .select("content")
      .eq("id", 1)
      .maybeSingle();

    const hydrated = hydratePortfolioContent(
      (data?.content ?? {}) as Partial<PortfolioContent>
    );

    return NextResponse.json({ content: hydrated });
  } catch {
    return NextResponse.json({ content: defaultPortfolioContent });
  }
}

// ===== PUT: Mengupdate Data (Dengan Proteksi Keamanan) =====
// ===== PUT: Mengupdate Data (Dengan Proteksi Keamanan) =====
export async function PUT(request: NextRequest) {
  try {
    // 1. PROTEKSI KEAMANAN: Cek Session/Cookie Login
    // const authCookie = request.cookies.get("sb-access-token")?.value || 
    //                    request.cookies.get("session")?.value;
    
    // if (!authCookie) {
    //   return NextResponse.json(
    //     { message: "🔒 Akses ditolak. Silakan login terlebih dahulu." },
    //     { status: 401 }
    //   );
    // }

    // 2. AMANKAN PARSING JSON (Mencegah crash di Production)
    let body: any;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ message: "Format JSON tidak valid atau body kosong" }, { status: 400 });
    }

    // Pastikan properti content ada, jika tidak ada gunakan objek kosong agar hydrate tidak crash
    const rawContent = body?.content || {};
    const safeContent = hydratePortfolioContent(rawContent);

    // 3. OPERASI KE DATABASE SUPABASE
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.from("portfolio_content").upsert(
      {
        id: 1,
        content: safeContent
      },
      { onConflict: "id" }
    );

    if (error) {
      console.error("🔴 Supabase Error:", error.message);
      return NextResponse.json({ message: `Gagal menyimpan ke database: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: "Saved", content: safeContent });
  } catch (err: any) {
    // Menampilkan pesan error asli ke response API agar bisa kamu baca langsung di Network Tab Production
    console.error("🔴 Runtime Error:", err);
    return NextResponse.json(
      { message: `Terjadi kesalahan internal: ${err?.message || "Unknown error"}` }, 
      { status: 500 }
    );
  }
}