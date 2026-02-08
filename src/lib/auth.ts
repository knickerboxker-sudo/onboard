import { NextRequest, NextResponse } from "next/server";

export function checkAdminAuth(req: NextRequest): boolean {
  const key = process.env.ADMIN_KEY;
  if (!key) return false;

  const cookieKey = req.cookies.get("admin_key")?.value;
  if (cookieKey === key) return true;

  const headerKey = req.headers.get("x-admin-key");
  if (headerKey === key) return true;

  const url = new URL(req.url);
  const queryKey = url.searchParams.get("admin_key");
  if (queryKey === key) return true;

  return false;
}

export function checkJobsAuth(req: NextRequest): boolean {
  const key = process.env.JOBS_API_KEY;
  if (!key) return false;

  const url = new URL(req.url);
  const queryKey = url.searchParams.get("key");
  if (queryKey === key) return true;

  const headerKey = req.headers.get("x-api-key");
  if (headerKey === key) return true;

  return false;
}

export function unauthorizedResponse(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
