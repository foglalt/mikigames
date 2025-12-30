import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

type UserRow = {
  username: string;
  registered_at: string | Date;
};

function normalizeUsername(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function toIso(value: string | Date): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = normalizeUsername(body?.username);

  if (username.length < 2) {
    return NextResponse.json(
      { error: "Username must be at least 2 characters" },
      { status: 400 }
    );
  }

  const sql = getSql();
  const rows = await sql<UserRow[]>`
    INSERT INTO users (username)
    VALUES (${username})
    ON CONFLICT (username)
    DO UPDATE SET username = EXCLUDED.username
    RETURNING username, registered_at
  `;

  const row = rows[0];
  return NextResponse.json({
    username: row.username,
    registeredAt: toIso(row.registered_at),
  });
}
