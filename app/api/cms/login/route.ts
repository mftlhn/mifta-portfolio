import { NextRequest, NextResponse } from "next/server";

const CMS_USERNAME = process.env.CMS_USERNAME || "admin";
const CMS_PASSWORD = process.env.CMS_PASSWORD || "password";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };

    if (body.username !== CMS_USERNAME || body.password !== CMS_PASSWORD) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = Buffer.from(`${CMS_USERNAME}:${Date.now()}`).toString("base64");

    return NextResponse.json({ token, message: "Login successful" }, { status: 200 });
  } catch {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }
}
