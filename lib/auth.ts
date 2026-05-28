// Simple auth utilities for CMS access
const CMS_COOKIE_NAME = "cms_session";
const CMS_PASSWORD = process.env.CMS_PASSWORD || "admin123";

export function validateCmsPassword(password: string): boolean {
  return password === CMS_PASSWORD;
}

export function generateSessionToken(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
