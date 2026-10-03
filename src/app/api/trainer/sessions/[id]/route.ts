import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { requireTenantSession } from "@/domain/authorization/tenant";
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

function asDate(value: unknown) {
  if (!value) return undefined;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    await requireTenantSession(user, id);
    const body = await request.json();
    const prisma = getPrisma();

    const current = await prisma.trainingSession.findUnique({
      where: { id },
      select: { id: true, playerId: true, startedAt: true, completedAt: true },
    });

    if (!current) {
      return NextResponse.json({ error: "Session not found." }, { status: 404 });
    }

    const sections = Array.isArray(body.sections) ? body.sections : null;
    const editingPlan = sections !== null;

    if (editingPlan && (current.startedAt || current.completedAt)) {
      return NextResponse.json(
        { error: "A workout plan can only be edited before the live session starts." },
        { status: 400 },
      );
    }

    const session = await prisma.$transaction(async (tx) => {
      if (editingPlan) {
        if (!sections.length) {
          throw new Error("PLAN_REQUIRED");
        }

        await tx.practicePlanItem.deleteMany({ where: { sessionId: id } });

        let sortOrder = 0;
        for (const section of sections) {
          const sectionTitle = asText(section?.title);
          if (!sectionTitle) continue;

          const sectionItem = await tx.practicePlanItem.create({
            data: {
              sessionId: id,
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
                sessionId: id,
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
      }

      await tx.trainingSession.update({
        where: { id },
        data: {
          scheduledFor: asDate(body.scheduledFor),
          sorenessLevel: body.sorenessLevel === undefined ? undefined : asText(body.sorenessLevel),
          bodyArea: body.bodyArea === undefined ? undefined : asText(body.bodyArea),
          discomfortLevel: body.discomfortLevel === undefined ? undefined : asDiscomfort(body.discomfortLevel),
          planAdjustmentReason: body.planAdjustmentReason === undefined ? undefined : asText(body.planAdjustmentReason),
          startedAt: body.startNow === true && !current.startedAt ? new Date() : undefined,
          summary: body.summary === undefined ? undefined : asText(body.summary),
          needsMoreWork: body.needsMoreWork === undefined ? undefined : asText(body.needsMoreWork),
          nextSessionFocus: body.nextSessionFocus === undefined ? undefined : asText(body.nextSessionFocus),
          completedAt: body.complete === true ? new Date() : undefined,
        },
      });

      return tx.trainingSession.findUniqueOrThrow({
        where: { id },
        include: {
          practicePlan: { orderBy: { sortOrder: "asc" } },
          progressEvents: { orderBy: { occurredAt: "asc" } },
        },
      });
    });

    if (body.complete === true && session.nextSessionFocus) {
      await prisma.$transaction(async (tx) => {
        await tx.developmentFocus.updateMany({
          where: { playerId: session.playerId, completedAt: null },
          data: { completedAt: new Date() },
        });
        await tx.developmentFocus.create({
          data: {
            playerId: session.playerId,
            focus: session.nextSessionFocus!,
            reason: "Approved session wrap-up",
          },
        });
      });
    }

    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "PLAN_REQUIRED") {
      return NextResponse.json({ error: "Add at least one practice-plan section." }, { status: 400 });
    }
    console.error("Failed to update training session", error);
    return NextResponse.json({ error: "Could not update training session." }, { status: 500 });
  }
}
