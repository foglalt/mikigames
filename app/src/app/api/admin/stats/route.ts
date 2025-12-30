import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isAdminTokenValid } from "@/lib/admin";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const token = cookies().get(adminCookieName())?.value;
  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getSql();
  const usersResult = await sql`SELECT COUNT(*)::int AS count FROM users`;
  const collectionsResult =
    await sql`SELECT COUNT(*)::int AS count FROM collections`;

  const totalUsers = Number(usersResult[0]?.count ?? 0);
  const totalCollections = Number(collectionsResult[0]?.count ?? 0);

  return NextResponse.json({ totalUsers, totalCollections });
}
