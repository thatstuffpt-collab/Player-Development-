import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request);
    const prisma = getPrisma();

    const memberships = user.role === "GUARDIAN"
      ? []
      : await prisma.organizationMembership.findMany({
          where: { userId: user.id },
          orderBy: [{ role: "asc" }, { createdAt: "asc" }],
          select: {
            role: true,
            tenant: {
              select: { id: true, name: true, slug: true },
            },
          },
        });

    const activeOrganization = memberships.find(
      (membership) => membership.tenant.id === user.tenantId,
    ) ?? memberships[0] ?? null;

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
      },
      activeOrganization: activeOrganization
        ? {
            ...activeOrganization.tenant,
            role: activeOrganization.role,
          }
        : null,
      organizations: memberships.map((membership) => ({
        ...membership.tenant,
        role: membership.role,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Failed to resolve authenticated user", error);
    return NextResponse.json({ error: "Authentication check failed." }, { status: 500 });
  }
}
