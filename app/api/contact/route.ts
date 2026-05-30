// app/api/contact/route.ts

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import { hydratePortfolioContent, PortfolioContent } from "@/lib/portfolio-data";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL =
  process.env.CONTACT_FROM_EMAIL ?? "Portfolio Contact <onboarding@resend.dev>";

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

// Ambil contactEmail dari Supabase (sama persis dengan GET di portfolio route)
async function getContactEmail(): Promise<string | null> {
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

    return hydrated.contactEmail?.trim() || null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body as {
      name?: string;
      email?: string;
      message?: string;
    };

    // Validasi field
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Semua field wajib diisi." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    // Ambil email tujuan dari CMS (Supabase)
    const receiverEmail = await getContactEmail();

    if (!receiverEmail) {
      console.error("[Contact] contactEmail tidak ditemukan di database.");
      return NextResponse.json(
        { error: "Email tujuan belum dikonfigurasi. Hubungi admin." },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: receiverEmail,
      replyTo: email,
      subject: `📬 Pesan baru dari ${name} — Portfolio`,
      html: `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px; background: #ffffff; border: 2px solid #111; border-radius: 12px;">
          <div style="background: #F5A623; border: 2px solid #111; border-radius: 8px; padding: 12px 20px; margin-bottom: 24px; display: inline-block;">
            <strong style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em;">📬 Pesan Masuk — Portfolio</strong>
          </div>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 700; width: 100px; color: #555; font-size: 13px;">Nama</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 15px;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-weight: 700; color: #555; font-size: 13px;">Email</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; font-size: 15px;">
                <a href="mailto:${escapeHtml(email)}" style="color: #4FC3B0;">${escapeHtml(email)}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: 700; color: #555; font-size: 13px; vertical-align: top; padding-top: 16px;">Pesan</td>
              <td style="padding: 10px 0; font-size: 15px; line-height: 1.6; padding-top: 16px; white-space: pre-wrap;">${escapeHtml(message)}</td>
            </tr>
          </table>

          <div style="margin-top: 28px; padding: 12px 16px; background: #E8FAF7; border-radius: 8px; font-size: 13px; color: #555;">
            💡 Balas email ini langsung untuk membalas ke <strong>${escapeHtml(email)}</strong>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("[Resend error]", error);
      return NextResponse.json(
        { error: "Gagal mengirim pesan. Coba lagi nanti." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[Contact API error]", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}