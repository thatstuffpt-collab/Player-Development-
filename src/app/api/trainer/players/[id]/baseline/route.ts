import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TEMPLATE_ID = "ttpt-default-v1";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id: playerId } = await context.params;
    const body = await request.json();
    const priorities = Array.isArray(body.priorities)
      ? body.priorities.map(String).filter(Boolean).slice(0, 3)
      : [];
    const shortTermGoal = String(body.shortTermGoal ?? "").trim();
    const bigPictureGoal = String(body.bigPictureGoal ?? "").trim();
    const ratings = Array.isArray(body.ratings) ? body.ratings : [];

    if (priorities.length < 2) {
      return NextResponse.json(
        { error: "Choose at least two development priorities." },
        { status: 400 },
      );
    }

    if (!shortTermGoal) {
      return NextResponse.json(
        { error: "Add the first short-term development goal." },
        { status: 400 },
      );
    }

    const prisma = getPrisma();
    const existing = await prisma.evaluation.findFirst({
      where: { playerId },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { error: "This player already has an evaluation. Use reevaluation instead." },
        { status: 409 },
      );
    }

    const criteria = await prisma.evaluationCriterion.findMany({
      where: { templateId: TEMPLATE_ID },
      select: { id: true, label: true },
    });
    const criterionByLabel = new Map(criteria.map((criterion) => [criterion.label, criterion.id]));

    const guardianEmail = String(body.guardianEmail ?? "").trim().toLowerCase();
    const guardianName = String(body.guardianName ?? "").trim() || null;

    const result = await prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { id: playerId },
        data: {
          selfReportedNeeds: String(body.selfReportedNeeds ?? "").trim() || undefined,
          playingExperience: String(body.playingExperience ?? "").trim() || undefined,
          trainingLimitations: String(body.trainingLimitations ?? "").trim() || undefined,
        },
      });

      if (guardianEmail) {
        const guardian = await tx.user.upsert({
          where: { email: guardianEmail },
          update: { displayName: guardianName ?? undefined },
          create: {
            email: guardianEmail,
            displayName: guardianName,
            role: "GUARDIAN",
          },
        });
        await tx.guardianPlayer.upsert({
          where: { guardianId_playerId: { guardianId: guardian.id, playerId } },
          update: {},
          create: { guardianId: guardian.id, playerId },
        });
      }

      const evaluation = await tx.evaluation.create({
        data: {
          playerId,
          templateId: TEMPLATE_ID,
          priorityAreas: priorities,
          shortTermGoal,
          nextFocus: priorities.join(" · "),
          ratings: {
            create: ratings.map((item: { category?: unknown; rating?: unknown; tags?: unknown; note?: unknown }) => {
              const category = String(item.category ?? "");
              const criterionId = criterionByLabel.get(category);
              if (!criterionId) throw new Error(`Unknown evaluation category: ${category}`);
              const numericRating = item.rating === null || item.rating === undefined ? null : Number(item.rating);
              if (numericRating !== null && (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5)) {
                throw new Error(`Invalid rating for ${category}`);
              }
              return {
                criterionId,
                rating: numericRating,
                observationTags: Array.isArray(item.tags) ? item.tags.map(String) : [],
                note: String(item.note ?? "").trim() || null,
              };
            }),
          },
        },
      });

      await tx.developmentFocus.create({
        data: {
          playerId,
          focus: priorities.join(" · "),
          reason: `Initial priorities from baseline evaluation ${evaluation.id}`,
        },
      });

      if (bigPictureGoal) {
        await tx.goal.create({
          data: {
            playerId,
            type: "BIG_PICTURE",
            title: bigPictureGoal,
          },
        });
      }

      await tx.goal.create({
        data: {
          playerId,
          type: "DEVELOPMENT",
          title: shortTermGoal,
        },
      });

      return evaluation;
    });

    return NextResponse.json({ evaluation: { id: result.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to save baseline evaluation", error);
    return NextResponse.json({ error: "Could not save baseline evaluation." }, { status: 500 });
  }
}
