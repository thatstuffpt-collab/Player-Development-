import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { requireTenantPlayer } from "@/domain/authorization/tenant";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeEmail(value: unknown) {
  return String(value ?? "").trim().toLowerCase();
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id: playerId } = await context.params;
    const player = await requireTenantPlayer(user, playerId);
    if (player.archivedAt) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const prisma = getPrisma();
    const guardians = await prisma.guardianPlayer.findMany({
      where: { playerId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        createdAt: true,
        guardian: {
          select: {
            id: true,
            email: true,
            displayName: true,
            firebaseUid: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      guardians: guardians.map((relationship) => ({
        relationshipId: relationship.id,
        guardianId: relationship.guardian.id,
        email: relationship.guardian.email,
        displayName: relationship.guardian.displayName,
        status: relationship.guardian.firebaseUid ? "ACTIVE" : "INVITED",
        createdAt: relationship.createdAt,
      })),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load player guardians", error);
    return NextResponse.json({ error: "Could not load parent/guardian connections." }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id: playerId } = await context.params;
    const player = await requireTenantPlayer(user, playerId);
    if (player.archivedAt) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const body = await request.json();
    const email = normalizeEmail(body.email);
    const displayName = String(body.displayName ?? "").trim() || null;

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Enter a valid parent/guardian email." }, { status: 400 });
    }

    const prisma = getPrisma();
    const result = await prisma.$transaction(async (tx) => {
      let guardian = await tx.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          displayName: true,
          firebaseUid: true,
          role: true,
        },
      });

      if (guardian && guardian.role !== "GUARDIAN") {
        throw new AuthError(
          "That email is already used by a trainer/admin account. Use a different parent/guardian email.",
          409,
        );
      }

      if (!guardian) {
        guardian = await tx.user.create({
          data: {
            tenantId: user.tenantId,
            email,
            displayName,
            role: "GUARDIAN",
          },
          select: {
            id: true,
            email: true,
            displayName: true,
            firebaseUid: true,
            role: true,
          },
        });
      } else if (displayName && displayName !== guardian.displayName) {
        guardian = await tx.user.update({
          where: { id: guardian.id },
          data: { displayName },
          select: {
            id: true,
            email: true,
            displayName: true,
            firebaseUid: true,
            role: true,
          },
        });
      }

      const relationship = await tx.guardianPlayer.upsert({
        where: {
          guardianId_playerId: {
            guardianId: guardian.id,
            playerId,
          },
        },
        update: {},
        create: {
          guardianId: guardian.id,
          playerId,
        },
      });

      return { guardian, relationship };
    });

    return NextResponse.json(
      {
        guardian: {
          relationshipId: result.relationship.id,
          guardianId: result.guardian.id,
          email: result.guardian.email,
          displayName: result.guardian.displayName,
          status: result.guardian.firebaseUid ? "ACTIVE" : "INVITED",
          createdAt: result.relationship.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to connect player guardian", error);
    return NextResponse.json({ error: "Could not connect this parent/guardian." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAppUser(request, ["TRAINER", "ADMIN"]);
    const { id: playerId } = await context.params;
    const player = await requireTenantPlayer(user, playerId);
    if (player.archivedAt) {
      return NextResponse.json({ error: "Player not found." }, { status: 404 });
    }

    const body = await request.json();
    const guardianId = String(body.guardianId ?? "").trim();
    if (!guardianId) {
      return NextResponse.json({ error: "Guardian is required." }, { status: 400 });
    }

    const prisma = getPrisma();
    const relationship = await prisma.guardianPlayer.findUnique({
      where: {
        guardianId_playerId: {
          guardianId,
          playerId,
        },
      },
      select: { id: true },
    });

    if (!relationship) {
      return NextResponse.json({ error: "Parent/guardian connection not found." }, { status: 404 });
    }

    await prisma.guardianPlayer.delete({
      where: {
        guardianId_playerId: {
          guardianId,
          playerId,
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to disconnect player guardian", error);
    return NextResponse.json({ error: "Could not remove this parent/guardian connection." }, { status: 500 });
  }
}
