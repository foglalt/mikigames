import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminCookieName, isAdminTokenValid } from "@/lib/admin";
import { getSql } from "@/lib/db";
import { ensureSchema } from "@/lib/schema";

export const runtime = "nodejs";

type CollectionRow = {
  id: number;
  username: string;
  location_id: string;
  location_name: string;
  collectible_id: string;
  collectible_title: string;
  collectible_content: string;
  collectible_author: string;
  collected_at: string | Date;
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
      c.id,
      u.username,
      c.location_id,
      c.location_name,
      c.collectible_id,
      c.collectible_title,
      c.collectible_content,
      c.collectible_author,
      c.collected_at
    FROM collections c
    JOIN users u ON c.user_id = u.id
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
        collectibleTitle: string;
        collectibleContent: string;
        collectibleAuthor: string;
        timestamp: string;
      }[];
      totalCount: number;
    }
  >();

  rows.forEach((row) => {
    const item = {
      id: String(row.id),
      username: row.username,
      locationId: row.location_id,
      locationName: row.location_name,
      collectibleId: row.collectible_id,
      collectibleTitle: row.collectible_title,
      collectibleContent: row.collectible_content,
      collectibleAuthor: row.collectible_author,
      timestamp: toIso(row.collected_at),
    };

    if (!userMap.has(row.username)) {
      userMap.set(row.username, {
        username: row.username,
        items: [item],
        totalCount: 1,
      });
    } else {
      const entry = userMap.get(row.username);
      if (entry) {
        entry.items.push(item);
        entry.totalCount += 1;
      }
    }
  });

  return NextResponse.json(Array.from(userMap.values()));
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

  return NextResponse.json({ ok: true });
}
