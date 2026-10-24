import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { parseDrillTemplateXlsx } from "@/lib/drill-spreadsheet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const bytes = await request.arrayBuffer();
    if (!bytes.byteLength) return NextResponse.json({ error: "Choose a spreadsheet file first." }, { status: 400 });
    if (bytes.byteLength > 5_000_000) return NextResponse.json({ error: "Spreadsheet files are limited to 5 MB." }, { status: 400 });

    const rows = parseDrillTemplateXlsx(bytes);
    return NextResponse.json({ rows });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not read the spreadsheet." }, { status: 400 });
  }
}
