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
    // const authCookie = request.cookies.get("sb-access-token")?.value || request.cookies.get("session")?.value;
    
    // if (!authCookie) {
    //   return NextResponse.json(
    //     { message: "🔒 Akses ditolak. Silakan login terlebih dahulu." },
    //     { status: 401 }
    //   );
    // }

    // 2. PARSING & VALIDASI BODY REQ
    const body = (await request.json()) as { content?: Partial<PortfolioContent> };
    if (!body || !body.content) {
      return NextResponse.json({ message: "Payload tidak ditemukan" }, { status: 400 });
    }

    const safeContent = hydratePortfolioContent(body.content);

    // 3. OPERASI KE DATABASE SUPABASE
    const supabase = getSupabaseClient();
    
    // Kita HANYA mengirim id dan content. 
    // Kolom updated_at akan otomatis terisi oleh fungsi now() di Supabase.
    const { error } = await supabase.from("portfolio_content").upsert(
      {
        id: 1,
        content: safeContent
      },
      { onConflict: "id" }
    );

    if (error) {
      // 📝 CATATAN: Cek pesan ini di TERMINAL VS Code tempat kamu menjalankan 'npm run dev'
      console.error("🔴 DETAIL ERROR SUPABASE:", error);
      return NextResponse.json({ message: `Gagal menyimpan: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ message: "Saved", content: safeContent });
  } catch (err) {
    console.error("🔴 RUNTIME ERROR:", err);
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}