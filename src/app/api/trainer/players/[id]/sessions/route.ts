import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asText(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function asDiscomfort(value: unknown) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 10) return null;
  return parsed;
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
      select: {
        id: true,
        firstName: true,
        lastName: true,
        preferredName: true,
        archivedAt: true,
        goals: {
          where: { status: "ACTIVE" },
          orderBy: { createdAt: "desc" },
          select: { id: true, title: true, type: true },
        },
        developmentFocuses: {
          where: { completedAt: null },
          orderBy: { startedAt: "desc" },
          take: 1,
          select: { id: true, focus: true, reason: true },
        },
        progressEvents: {
          orderBy: { occurredAt: "desc" },
          take: 5,
          select: {
            id: true,
            occurredAt: true,
            type: true,
            category: true,
            title: true,
            result: true,
            spot: true,
            notes: true,
            nextStep: true,
          },
        },
        trainingSessions: {
          orderBy: { scheduledFor: "desc" },
          take: 5,
          include: {
            practicePlan: { orderBy: { sortOrder: "asc" } },
            progressEvents: { orderBy: { occurredAt: "asc" } },
          },
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
    console.error("Failed to load session workspace", error);
    return NextResponse.json({ error: "Could not load session workspace." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id: playerId } = await context.params;
    const body = await request.json();
    const prisma = getPrisma();

    const existingPlayer = await prisma.player.findFirst({
      where: { id: playerId, archivedAt: null },
      select: { id: true },
    });
    if (!existingPlayer) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const sections = Array.isArray(body.sections) ? body.sections : [];
    if (!sections.length) {
      return NextResponse.json({ error: "Add at least one practice-plan section." }, { status: 400 });
    }

    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.trainingSession.create({
        data: {
          playerId,
          scheduledFor: new Date(),
          primaryFocus: body.primaryFocus ?? "OTHER",
          customFocus: asText(body.customFocus),
          sessionGoal: asText(body.sessionGoal),
          sorenessLevel: asText(body.sorenessLevel),
          bodyArea: asText(body.bodyArea),
          discomfortLevel: asDiscomfort(body.discomfortLevel),
          planAdjustmentReason: asText(body.planAdjustmentReason),
        },
      });

      let sortOrder = 0;
      for (const section of sections) {
        const sectionTitle = asText(section?.title);
        if (!sectionTitle) continue;
        const sectionItem = await tx.practicePlanItem.create({
          data: {
            sessionId: created.id,
            itemType: "SECTION",
            focusArea: section.focusArea ?? null,
            sortOrder: sortOrder++,
            title: sectionTitle,
            notes: asText(section.notes),
          },
        });

        const drills = Array.isArray(section?.drills) ? section.drills : [];
        for (const drill of drills) {
          const drillTitle = asText(drill?.title);
          if (!drillTitle) continue;
          await tx.practicePlanItem.create({
            data: {
              sessionId: created.id,
              parentItemId: sectionItem.id,
              itemType: "DRILL",
              focusArea: drill.focusArea ?? section.focusArea ?? null,
              sortOrder: sortOrder++,
              title: drillTitle,
              notes: asText(drill.notes),
            },
          });
        }
      }

      return tx.trainingSession.findUniqueOrThrow({
        where: { id: created.id },
        include: { practicePlan: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create training session", error);
    return NextResponse.json({ error: "Could not create training session." }, { status: 500 });
  }
}
