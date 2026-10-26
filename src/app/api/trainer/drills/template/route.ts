import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { buildDrillTemplateXlsx } from "@/lib/drill-spreadsheet";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const workbook = buildDrillTemplateXlsx();
    return new NextResponse(workbook, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="thats-tuff-drill-library-template.xlsx"',
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Failed to build drill template", error);
    return NextResponse.json({ error: "Could not build the drill template." }, { status: 500 });
  }
}
