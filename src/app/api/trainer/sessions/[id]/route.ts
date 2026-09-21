import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asText(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
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

    const session = await prisma.trainingSession.update({
      where: { id },
      data: {
        summary: body.summary === undefined ? undefined : asText(body.summary),
        needsMoreWork: body.needsMoreWork === undefined ? undefined : asText(body.needsMoreWork),
        nextSessionFocus: body.nextSessionFocus === undefined ? undefined : asText(body.nextSessionFocus),
        completedAt: body.complete === true ? new Date() : undefined,
      },
      include: {
        practicePlan: { orderBy: { sortOrder: "asc" } },
        progressEvents: { orderBy: { occurredAt: "asc" } },
      },
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
    console.error("Failed to update training session", error);
    return NextResponse.json({ error: "Could not update training session." }, { status: 500 });
  }
}
