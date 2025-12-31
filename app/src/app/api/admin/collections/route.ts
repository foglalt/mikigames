import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isAdminTokenValid } from "@/lib/admin";
import { getSql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";
import { START_LOCATION_ID } from "@/config";

export const runtime = "nodejs";

type CollectionRow = {
  id: number | null;
  username: string;
  location_id: string | null;
  location_name: string | null;
  collectible_id: string | null;
  collectible_content: string | null;
  collectible_author: string | null;
  collected_at: string | Date | null;
};

function toIso(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    SELECT
      u.username,
      c.id,
      c.location_id,
      c.location_name,
      c.collectible_id,
      c.collectible_content,
      c.collectible_author,
      c.collected_at
    FROM users u
    LEFT JOIN collections c ON c.user_id = u.id
      AND c.location_id <> ${START_LOCATION_ID}
    ORDER BY u.username ASC, c.collected_at ASC
  `) as CollectionRow[];

  const userMap = new Map<
    string,
    {
      username: string;
      items: {
        id: string;
        username: string;
        locationId: string;
        locationName: string;
        collectibleId: string;
        collectibleContent: string;
        collectibleAuthor: string;
        timestamp: string;
      }[];
      totalCount: number;
    }
  >();

  rows.forEach((row) => {
    if (!userMap.has(row.username)) {
      userMap.set(row.username, {
        username: row.username,
        items: [],
        totalCount: 0,
      });
    }

    if (!row.id) {
      return;
    }

    const entry = userMap.get(row.username);
    if (!entry) return;

    entry.items.push({
      id: String(row.id),
      username: row.username,
      locationId: row.location_id || "",
      locationName: row.location_name || "",
      collectibleId: row.collectible_id || "",
      collectibleContent: row.collectible_content || "",
      collectibleAuthor: row.collectible_author || "",
      timestamp: toIso(row.collected_at ?? new Date(0)),
    });
    entry.totalCount += 1;
  });

  const result = Array.from(userMap.values()).sort((a, b) => {
    if (b.totalCount !== a.totalCount) {
      return b.totalCount - a.totalCount;
    }
    return a.username.localeCompare(b.username);
  });

  return NextResponse.json(result);
}

export async function DELETE() {
  const cookieStore = await cookies();
  const token = cookieStore.get(adminCookieName())?.value;
  if (!isAdminTokenValid(token)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSchema();
  const sql = getSql();
  await sql`DELETE FROM collections`;
  await sql`DELETE FROM users`;

  return NextResponse.json({ ok: true });
}
