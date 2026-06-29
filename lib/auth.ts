import type { NextRequest } from "next/server";

export const CMS_COOKIE_NAME = "cms_session";
const CMS_PASSWORD = process.env.CMS_PASSWORD || "KMZWAY87AA";

export function validateCmsPassword(password: string): boolean {
  return password === CMS_PASSWORD;
}

export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function isAuthenticated(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(CMS_COOKIE_NAME);
  return Boolean(sessionCookie?.value);
}
