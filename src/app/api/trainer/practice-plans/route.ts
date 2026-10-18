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

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const prisma = getPrisma();
    const plans = await prisma.groupPracticePlan.findMany({
      where: { tenantId: user.tenantId },
      orderBy: [{ scheduledFor: "desc" }, { updatedAt: "desc" }],
      include: { items: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ plans });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load group/camp practice plans", error);
    return NextResponse.json({ error: "Could not load practice plans." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
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
      const created = await tx.groupPracticePlan.create({
        data: {
          tenantId: user.tenantId,
          title,
          planType: planType(body.planType),
          scheduledFor: asDate(body.scheduledFor),
          notes: asText(body.notes),
        },
      });

      let sortOrder = 0;
      for (const section of sections) {
        const sectionTitle = asText(section?.title);
        if (!sectionTitle) continue;
        const sectionItem = await tx.groupPracticePlanItem.create({
          data: {
            planId: created.id,
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
              planId: created.id,
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
        where: { id: created.id },
        include: { items: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create group/camp practice plan", error);
    return NextResponse.json({ error: "Could not save practice plan." }, { status: 500 });
  }
}
