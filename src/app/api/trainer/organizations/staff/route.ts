import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireStaffManager(userId: string, tenantId: string) {
  const prisma = getPrisma();
  const membership = await prisma.organizationMembership.findUnique({
    where: { tenantId_userId: { tenantId, userId } },
    select: { role: true },
  });

  if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
    throw new AuthError("Only an organization owner or admin can manage staff.", 403);
  }

  return membership;
}

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const prisma = getPrisma();

    const memberships = await prisma.organizationMembership.findMany({
      where: { tenantId: user.tenantId },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        role: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firebaseUid: true,
          },
        },
      },
    });

    return NextResponse.json({
      staff: memberships.map((membership) => ({
        id: membership.id,
        role: membership.role,
        createdAt: membership.createdAt,
        userId: membership.user.id,
        email: membership.user.email,
        displayName: membership.user.displayName,
        status: membership.user.firebaseUid ? "ACTIVE" : "INVITED",
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load organization staff", error);
    return NextResponse.json({ error: "Could not load organization staff." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    await requireStaffManager(user.id, user.tenantId);

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid trainer email address." }, { status: 400 });
    }

    const prisma = getPrisma();

    const invited = await prisma.$transaction(async (tx) => {
      let invitedUser = await tx.user.findUnique({ where: { email } });

      if (invitedUser?.role === "GUARDIAN") {
        throw new Error("GUARDIAN_CONFLICT");
      }

      if (!invitedUser) {
        invitedUser = await tx.user.create({
          data: {
            tenantId: user.tenantId,
            email,
            role: "TRAINER",
          },
        });
      }

      const membership = await tx.organizationMembership.upsert({
        where: {
          tenantId_userId: {
            tenantId: user.tenantId,
            userId: invitedUser.id,
          },
        },
        update: {},
        create: {
          tenantId: user.tenantId,
          userId: invitedUser.id,
          role: "TRAINER",
        },
        select: {
          id: true,
          role: true,
          createdAt: true,
        },
      });

      return {
        ...membership,
        userId: invitedUser.id,
        email: invitedUser.email,
        displayName: invitedUser.displayName,
        status: invitedUser.firebaseUid ? "ACTIVE" : "INVITED",
      };
    });

    return NextResponse.json({ staffMember: invited }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof Error && error.message === "GUARDIAN_CONFLICT") {
      return NextResponse.json(
        { error: "That email is currently a guardian account and cannot be invited as trainer staff yet." },
        { status: 409 },
      );
    }
    console.error("Failed to invite organization staff", error);
    return NextResponse.json({ error: "Could not invite trainer." }, { status: 500 });
  }
}
