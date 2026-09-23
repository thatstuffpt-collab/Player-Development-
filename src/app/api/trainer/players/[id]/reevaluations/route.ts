import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id: playerId } = await context.params;
    const body = await request.json();
    const prisma = getPrisma();

    const previous = await prisma.evaluation.findFirst({
      where: { playerId },
      orderBy: { evaluatedAt: "desc" },
      include: { template: { include: { criteria: true } } },
    });
    if (!previous) return NextResponse.json({ error: "Complete a baseline evaluation first." }, { status: 409 });

    const priorities = Array.isArray(body.priorities) ? body.priorities.map(String).filter(Boolean).slice(0, 3) : [];
    const shortTermGoal = String(body.shortTermGoal ?? "").trim();
    const ratings = Array.isArray(body.ratings) ? body.ratings : [];
    if (priorities.length < 2) return NextResponse.json({ error: "Choose at least two development priorities." }, { status: 400 });
    if (!shortTermGoal) return NextResponse.json({ error: "Add the updated short-term goal." }, { status: 400 });

    const criterionByLabel = new Map(previous.template.criteria.map((criterion) => [criterion.label, criterion.id]));
    const result = await prisma.$transaction(async (tx) => {
      const evaluation = await tx.evaluation.create({
        data: {
          playerId,
          templateId: previous.templateId,
          priorityAreas: priorities,
          shortTermGoal,
          nextFocus: priorities.join(" · "),
          summary: String(body.summary ?? "").trim() || null,
          ratings: {
            create: ratings.map((item: { category?: unknown; rating?: unknown; note?: unknown }) => {
              const category = String(item.category ?? "");
              const criterionId = criterionByLabel.get(category);
              if (!criterionId) throw new Error(`Unknown evaluation category: ${category}`);
              const rating = item.rating === null || item.rating === undefined ? null : Number(item.rating);
              if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) throw new Error(`Invalid rating for ${category}`);
              return { criterionId, rating, note: String(item.note ?? "").trim() || null };
            }),
          },
        },
      });

      await tx.developmentFocus.updateMany({
        where: { playerId, completedAt: null },
        data: { completedAt: new Date() },
      });
      await tx.developmentFocus.create({
        data: { playerId, focus: priorities.join(" · "), reason: `Updated from reevaluation ${evaluation.id}` },
      });
      await tx.goal.create({
        data: { playerId, type: "DEVELOPMENT", title: shortTermGoal },
      });
      return evaluation;
    });

    return NextResponse.json({ evaluation: { id: result.id } }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Failed to save reevaluation", error);
    return NextResponse.json({ error: "Could not save reevaluation." }, { status: 500 });
  }
}
