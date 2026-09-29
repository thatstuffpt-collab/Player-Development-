import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "organization";
}

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const prisma = getPrisma();
    const memberships = await prisma.organizationMembership.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        tenant: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      activeOrganizationId: user.tenantId,
      organizations: memberships.map((membership) => ({
        ...membership.tenant,
        role: membership.role,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load organizations", error);
    return NextResponse.json({ error: "Could not load organizations." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    if (name.length < 2) {
      return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
    }

    const prisma = getPrisma();
    const baseSlug = slugify(name);
    const existing = await prisma.tenant.findUnique({ where: { slug: baseSlug }, select: { id: true } });
    const slug = existing ? `${baseSlug}-${randomUUID().slice(0, 8)}` : baseSlug;

    const organization = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({ data: { name, slug } });
      await tx.organizationMembership.create({
        data: { tenantId: tenant.id, userId: user.id, role: "OWNER" },
      });
      return tenant;
    });

    return NextResponse.json({
      organization: { ...organization, role: "OWNER" },
    }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create organization", error);
    return NextResponse.json({ error: "Could not create organization." }, { status: 500 });
  }
}
