import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isAdminTokenValid } from "@/lib/admin";

export const runtime = "nodejs";

export async function GET() {
  const token = cookies().get(adminCookieName())?.value;
  const authenticated = isAdminTokenValid(token);
  return NextResponse.json({ authenticated });
}
