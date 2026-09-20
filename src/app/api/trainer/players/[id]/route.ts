import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseOptionalDate(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseOptionalInt(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    const prisma = getPrisma();
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        goals: { orderBy: { createdAt: "desc" } },
        developmentFocuses: { orderBy: { startedAt: "desc" } },
        evaluations: {
          orderBy: { evaluatedAt: "desc" },
          select: {
            id: true,
            evaluatedAt: true,
            summary: true,
            priorityAreas: true,
            shortTermGoal: true,
            nextFocus: true,
          },
        },
        achievements: { orderBy: { achievedAt: "desc" } },
        assignedWork: { orderBy: { assignedAt: "desc" } },
        trainerNotes: { orderBy: { createdAt: "desc" } },
        coachTags: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!player || player.archivedAt) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    return NextResponse.json({ player });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load player", error);
    return NextResponse.json({ error: "Could not load player." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    const body = await request.json();
    const prisma = getPrisma();

    const player = await prisma.player.update({
      where: { id },
      data: {
        firstName: body.firstName === undefined ? undefined : String(body.firstName).trim(),
        lastName: body.lastName === undefined ? undefined : String(body.lastName).trim(),
        preferredName:
          body.preferredName === undefined
            ? undefined
            : String(body.preferredName).trim() || null,
        birthDate: body.birthDate === undefined ? undefined : parseOptionalDate(body.birthDate),
        classYear: body.classYear === undefined ? undefined : parseOptionalInt(body.classYear),
        height: body.height === undefined ? undefined : String(body.height).trim() || null,
        position: body.position === undefined ? undefined : String(body.position).trim() || null,
        schoolTeam:
          body.schoolTeam === undefined ? undefined : String(body.schoolTeam).trim() || null,
        yearsPlaying:
          body.yearsPlaying === undefined ? undefined : parseOptionalInt(body.yearsPlaying),
        playingExperience:
          body.playingExperience === undefined
            ? undefined
            : String(body.playingExperience).trim() || null,
        selfReportedNeeds:
          body.selfReportedNeeds === undefined
            ? undefined
            : String(body.selfReportedNeeds).trim() || null,
        trainingLimitations:
          body.trainingLimitations === undefined
            ? undefined
            : String(body.trainingLimitations).trim() || null,
      },
    });

    return NextResponse.json({ player });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update player", error);
    return NextResponse.json({ error: "Could not update player." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    const prisma = getPrisma();
    await prisma.player.update({
      where: { id },
      data: { archivedAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to archive player", error);
    return NextResponse.json({ error: "Could not archive player." }, { status: 500 });
  }
}
