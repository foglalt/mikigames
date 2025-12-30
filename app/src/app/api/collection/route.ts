import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

type CollectionRow = {
  id: number;
  location_id: string;
  location_name: string;
  collectible_id: string;
  collectible_title: string;
  collectible_content: string;
  collectible_author: string;
  collected_at: string | Date;
  username: string;
};

function toIso(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

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
    WHERE u.username = ${username}
    ORDER BY c.collected_at ASC
  `) as CollectionRow[];

  const items = rows.map((row) => ({
    id: String(row.id),
    username: row.username,
    locationId: row.location_id,
    locationName: row.location_name,
    collectibleId: row.collectible_id,
    collectibleTitle: row.collectible_title,
    collectibleContent: row.collectible_content,
    collectibleAuthor: row.collectible_author,
    timestamp: toIso(row.collected_at),
  }));

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const locationId = typeof body?.locationId === "string" ? body.locationId : "";

  if (!username || username.length < 2 || !locationId) {
    return NextResponse.json(
      { error: "Username and locationId are required" },
      { status: 400 }
    );
  }

  const locationName =
    typeof body?.locationName === "string" ? body.locationName : "";
  const collectibleId =
    typeof body?.collectibleId === "string" ? body.collectibleId : "";
  const collectibleTitle =
    typeof body?.collectibleTitle === "string" ? body.collectibleTitle : "";
  const collectibleContent =
    typeof body?.collectibleContent === "string"
      ? body.collectibleContent
      : "";
  const collectibleAuthor =
    typeof body?.collectibleAuthor === "string"
      ? body.collectibleAuthor
      : "";

  const sql = getSql();
  const users = (await sql`
    INSERT INTO users (username)
    VALUES (${username})
    ON CONFLICT (username)
    DO UPDATE SET username = EXCLUDED.username
    RETURNING id
  `) as { id: number }[];
  const userId = users[0]?.id;
  if (!userId) {
    return NextResponse.json(
      { error: "Failed to resolve user" },
      { status: 500 }
    );
  }

  const inserted = (await sql`
    INSERT INTO collections (
      user_id,
      location_id,
      location_name,
      collectible_id,
      collectible_title,
      collectible_content,
      collectible_author
    )
    VALUES (
      ${userId},
      ${locationId},
      ${locationName},
      ${collectibleId},
      ${collectibleTitle},
      ${collectibleContent},
      ${collectibleAuthor}
    )
    ON CONFLICT (user_id, location_id)
    DO NOTHING
    RETURNING
      id,
      ${username} AS username,
      location_id,
      location_name,
      collectible_id,
      collectible_title,
      collectible_content,
      collectible_author,
      collected_at
  `) as CollectionRow[];

  if (inserted.length === 0) {
    return NextResponse.json({ created: false });
  }

  const row = inserted[0];
  return NextResponse.json({
    created: true,
    item: {
      id: String(row.id),
      username: row.username,
      locationId: row.location_id,
      locationName: row.location_name,
      collectibleId: row.collectible_id,
      collectibleTitle: row.collectible_title,
      collectibleContent: row.collectible_content,
      collectibleAuthor: row.collectible_author,
      timestamp: toIso(row.collected_at),
    },
  });
}
