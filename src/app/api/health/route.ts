import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "thats-tuff-player-development",
    runtime: "nextjs",
  });
}
