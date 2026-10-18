import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function asText(value: unknown) {
  const text = String(value ?? "").trim();
  return text || null;
}

function asDate(value: unknown) {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function planType(value: unknown): "GROUP" | "CAMP" {
  return String(value ?? "").toUpperCase() === "CAMP" ? "CAMP" : "GROUP";
}

async function requireTenantPlan(user: { tenantId: string }, id: string) {
  const prisma = getPrisma();
  const plan = await prisma.groupPracticePlan.findFirst({
    where: { id, tenantId: user.tenantId },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });
  if (!plan) throw new AuthError("Practice plan not found.", 404);
  return plan;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    const plan = await requireTenantPlan(user, id);
    return NextResponse.json({ plan });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load group/camp practice plan", error);
    return NextResponse.json({ error: "Could not load practice plan." }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    await requireTenantPlan(user, id);
    const body = await request.json();
    const title = asText(body.title);
    const sections = Array.isArray(body.sections) ? body.sections : [];

    if (!title) {
      return NextResponse.json({ error: "Plan title is required." }, { status: 400 });
    }
    if (!sections.length) {
      return NextResponse.json({ error: "Add at least one practice-plan section." }, { status: 400 });
    }

    const prisma = getPrisma();
    const plan = await prisma.$transaction(async (tx) => {
      await tx.groupPracticePlan.update({
        where: { id },
        data: {
          title,
          planType: planType(body.planType),
          scheduledFor: asDate(body.scheduledFor),
          notes: asText(body.notes),
        },
      });

      await tx.groupPracticePlanItem.deleteMany({ where: { planId: id } });

      let sortOrder = 0;
      for (const section of sections) {
        const sectionTitle = asText(section?.title);
        if (!sectionTitle) continue;
        const sectionItem = await tx.groupPracticePlanItem.create({
          data: {
            planId: id,
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
          await tx.groupPracticePlanItem.create({
            data: {
              planId: id,
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

      return tx.groupPracticePlan.findUniqueOrThrow({
        where: { id },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json({ plan });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update group/camp practice plan", error);
    return NextResponse.json({ error: "Could not update practice plan." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id } = await context.params;
    await requireTenantPlan(user, id);
    const prisma = getPrisma();
    await prisma.groupPracticePlan.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to delete group/camp practice plan", error);
    return NextResponse.json({ error: "Could not delete practice plan." }, { status: 500 });
  }
}
