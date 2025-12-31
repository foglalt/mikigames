import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isAdminTokenValid } from "@/lib/admin";
import { getSql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";
import { START_LOCATION_ID } from "@/config";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSchema();
  const sql = getSql();
  const usersResult = (await sql`
    SELECT COUNT(*)::int AS count FROM users
  `) as { count: number }[];
  const collectionsResult = (await sql`
    SELECT COUNT(*)::int AS count
    FROM collections
    WHERE location_id <> ${START_LOCATION_ID}
  `) as { count: number }[];

  const totalUsers = Number(usersResult[0]?.count ?? 0);
  const totalCollections = Number(collectionsResult[0]?.count ?? 0);

  return NextResponse.json({ totalUsers, totalCollections });
}
