import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const typeMap: Record<string, "SHOOTING_RESULT" | "DRIBBLING_RESULT" | "DRILL_PROGRESSION" | "GOAL_CHECK" | "COACH_OBSERVATION" | "BODY_READINESS" | "OTHER"> = {
  "Drill result": "DRILL_PROGRESSION",
  "Shooting result": "SHOOTING_RESULT",
  "Dribbling result": "DRIBBLING_RESULT",
  "Goal progress": "GOAL_CHECK",
  "Goal check": "GOAL_CHECK",
  "Coach observation": "COACH_OBSERVATION",
  "Body/readiness update": "BODY_READINESS",
};

const nextMap: Record<string, "GOAL_MET" | "KEEP_PROGRESSING" | "REVISIT_NEXT_SESSION" | "CHANGE_FOCUS"> = {
  "Goal met": "GOAL_MET",
  "Keep progressing": "KEEP_PROGRESSING",
  "Revisit next session": "REVISIT_NEXT_SESSION",
  "Change focus": "CHANGE_FOCUS",
};

function asText(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id: sessionId } = await context.params;
    const body = await request.json();
    const prisma = getPrisma();

    const session = await prisma.trainingSession.findUnique({
      where: { id: sessionId },
      select: { id: true, playerId: true },
    });
    if (!session) return NextResponse.json({ error: "Session not found." }, { status: 404 });

    const result = asText(body.result);
    const notes = asText(body.notes);
    if (!result && !notes) {
      return NextResponse.json({ error: "Add a result or coaching note." }, { status: 400 });
    }

    let planItem = null;
    if (body.practicePlanItemId) {
      planItem = await prisma.practicePlanItem.findFirst({
        where: { id: String(body.practicePlanItemId), sessionId },
        select: { id: true, title: true, parentItem: { select: { title: true } } },
      });
      if (!planItem) return NextResponse.json({ error: "Drill does not belong to this session." }, { status: 400 });
    }

    const title = asText(body.title) ?? planItem?.title ?? "Session note";
    const category = asText(body.category) ?? planItem?.parentItem?.title ?? "Session";

    const event = await prisma.progressEvent.create({
      data: {
        playerId: session.playerId,
        sessionId,
        practicePlanItemId: planItem?.id ?? null,
        type: typeMap[String(body.type ?? "")] ?? "OTHER",
        category,
        title,
        result: result ?? notes ?? "Logged",
        spot: asText(body.spot),
        notes,
        nextStep: nextMap[String(body.next ?? "")] ?? null,
        parentVisible: false,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to save Quick Log", error);
    return NextResponse.json({ error: "Could not save Quick Log." }, { status: 500 });
  }
}
