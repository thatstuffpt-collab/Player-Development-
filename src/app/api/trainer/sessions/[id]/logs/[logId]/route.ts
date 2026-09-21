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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string; logId: string }> },
) {
  try {
    await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id: sessionId, logId } = await context.params;
    const body = await request.json();
    const prisma = getPrisma();

    const current = await prisma.progressEvent.findFirst({
      where: { id: logId, sessionId },
      select: { id: true },
    });
    if (!current) return NextResponse.json({ error: "Quick Log not found." }, { status: 404 });

    let planItem = null;
    if (body.practicePlanItemId) {
      planItem = await prisma.practicePlanItem.findFirst({
        where: { id: String(body.practicePlanItemId), sessionId },
        select: { id: true, title: true, parentItem: { select: { title: true } } },
      });
      if (!planItem) return NextResponse.json({ error: "Drill does not belong to this session." }, { status: 400 });
    }

    const result = asText(body.result);
    const notes = asText(body.notes);
    if (!result && !notes) return NextResponse.json({ error: "Add a result or coaching note." }, { status: 400 });

    const event = await prisma.progressEvent.update({
      where: { id: logId },
      data: {
        practicePlanItemId: body.practicePlanItemId === undefined ? undefined : planItem?.id ?? null,
        type: body.type === undefined ? undefined : typeMap[String(body.type)] ?? "OTHER",
        category: body.category === undefined ? undefined : asText(body.category) ?? planItem?.parentItem?.title ?? "Session",
        title: body.title === undefined ? undefined : asText(body.title) ?? planItem?.title ?? "Session note",
        result: result ?? notes ?? "Logged",
        spot: body.spot === undefined ? undefined : asText(body.spot),
        notes,
        nextStep: body.next === undefined ? undefined : nextMap[String(body.next)] ?? null,
      },
    });

    return NextResponse.json({ event });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    console.error("Failed to edit Quick Log", error);
    return NextResponse.json({ error: "Could not edit Quick Log." }, { status: 500 });
  }
}
