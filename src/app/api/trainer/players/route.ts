import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOptionalDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseOptionalInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function GET(request: Request) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const prisma = getPrisma();
    const players = await prisma.player.findMany({
      where: { archivedAt: null },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        preferredName: true,
        classYear: true,
        position: true,
        schoolTeam: true,
        createdAt: true,
        developmentFocuses: {
          where: { completedAt: null },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { focus: true },
        },
      },
    });

    return NextResponse.json({ players });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to list players", error);
    return NextResponse.json({ error: "Could not load players." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const body = await request.json();
    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();

    if (!firstName || !lastName) {
      return NextResponse.json(
        { error: "First and last name are required." },
        { status: 400 },
      );
    }

    const prisma = getPrisma();
    const player = await prisma.player.create({
      data: {
        firstName,
        lastName,
        preferredName: String(body.preferredName ?? "").trim() || null,
        birthDate: parseOptionalDate(body.birthDate),
        classYear: parseOptionalInt(body.classYear),
        height: String(body.height ?? "").trim() || null,
        position: String(body.position ?? "").trim() || null,
        schoolTeam: String(body.schoolTeam ?? "").trim() || null,
        yearsPlaying: parseOptionalInt(body.yearsPlaying),
        playingExperience: String(body.playingExperience ?? "").trim() || null,
        selfReportedNeeds: String(body.selfReportedNeeds ?? "").trim() || null,
        trainingLimitations: String(body.trainingLimitations ?? "").trim() || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create player", error);
    return NextResponse.json({ error: "Could not create player." }, { status: 500 });
  }
}
