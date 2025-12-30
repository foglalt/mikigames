import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();
  const locationId = searchParams.get("locationId");

  if (!username || username.length < 2 || !locationId) {
    return NextResponse.json(
      { error: "Username and locationId are required" },
      { status: 400 }
    );
  }

  const sql = getSql();
  const rows = await sql`
    SELECT 1
    FROM collections c
    JOIN users u ON c.user_id = u.id
    WHERE u.username = ${username}
      AND c.location_id = ${locationId}
    LIMIT 1
  `;

  return NextResponse.json({ exists: rows.length > 0 });
}
