import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, createAdminToken } from "@/lib/admin";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const password = typeof body?.password === "string" ? body.password : "";

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD is not configured" },
      { status: 500 }
    );
  }

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const token = createAdminToken();
  if (!token) {
    return NextResponse.json(
      { error: "ADMIN_SESSION_SECRET is not configured" },
      { status: 500 }
    );
  }

  cookies().set(adminCookieName(), token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return NextResponse.json({ authenticated: true });
}
