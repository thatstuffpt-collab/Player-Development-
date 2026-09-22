import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const presets: Record<string, { category: string; name: string; unit: string; lowerIsBetter: boolean }> = {
  "vertical-jump": { category: "Vertical / Power", name: "Vertical Jump", unit: "in", lowerIsBetter: false },
  "broad-jump": { category: "Vertical / Power", name: "Broad Jump", unit: "in", lowerIsBetter: false },
  "10-yard-sprint": { category: "Speed", name: "10-Yard Sprint", unit: "sec", lowerIsBetter: true },
  "20-yard-sprint": { category: "Speed", name: "20-Yard Sprint", unit: "sec", lowerIsBetter: true },
  "5-10-5-shuttle": { category: "Agility / COD", name: "5-10-5 Shuttle", unit: "sec", lowerIsBetter: true },
  "lane-agility": { category: "Agility / COD", name: "Lane Agility", unit: "sec", lowerIsBetter: true },
  "push-ups": { category: "Strength", name: "Push-Ups", unit: "reps", lowerIsBetter: false },
  "squat": { category: "Strength", name: "Squat", unit: "lb", lowerIsBetter: false },
  "conditioning-time": { category: "Conditioning", name: "Conditioning Test", unit: "sec", lowerIsBetter: true },
  "mobility-score": { category: "Mobility / Movement", name: "Movement Score", unit: "score", lowerIsBetter: false },
};

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    const prisma = getPrisma();
    const tests = await prisma.athleticTest.findMany({ where: { playerId: id }, orderBy: { testedAt: "asc" } });
    return NextResponse.json({ tests });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Failed to load athletic tests", error);
    return NextResponse.json({ error: "Could not load athletic tests." }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    const body = await request.json();
    const value = Number(body.value);
    if (!Number.isFinite(value)) return NextResponse.json({ error: "Enter a valid test result." }, { status: 400 });

    const selected = String(body.testKey ?? "");
    const preset = presets[selected];
    const customName = String(body.testName ?? "").trim();
    const testName = preset?.name ?? customName;
    if (!testName) return NextResponse.json({ error: "Choose or name a test." }, { status: 400 });

    const prisma = getPrisma();
    const player = await prisma.player.findFirst({ where: { id, archivedAt: null }, select: { id: true } });
    if (!player) return NextResponse.json({ error: "Player not found." }, { status: 404 });

    const test = await prisma.athleticTest.create({
      data: {
        playerId: id,
        category: preset?.category ?? String(body.category ?? "Other").trim(),
        testKey: preset ? selected : slug(testName),
        testName,
        value,
        unit: preset?.unit ?? String(body.unit ?? "score").trim(),
        lowerIsBetter: preset?.lowerIsBetter ?? Boolean(body.lowerIsBetter),
        notes: String(body.notes ?? "").trim() || null,
        testedAt: body.testedAt ? new Date(String(body.testedAt)) : new Date(),
      },
    });
    return NextResponse.json({ test }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Failed to save athletic test", error);
    return NextResponse.json({ error: "Could not save athletic test." }, { status: 500 });
  }
}
