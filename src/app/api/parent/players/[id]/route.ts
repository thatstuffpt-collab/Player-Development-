import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { parentPlayerSelect } from "@/domain/authorization/player-views";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAppUser(request, ["GUARDIAN"]);
    const { id } = await context.params;
    const prisma = getPrisma();

    const relationship = await prisma.guardianPlayer.findUnique({
      where: {
        guardianId_playerId: {
          guardianId: user.id,
          playerId: id,
        },
      },
      select: {
        player: {
          select: parentPlayerSelect,
        },
      },
    });

    if (!relationship) {
      return NextResponse.json({ error: "Athlete not found." }, { status: 404 });
    }

    return NextResponse.json({ player: relationship.player });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load parent athlete", error);
    return NextResponse.json({ error: "Could not load this athlete." }, { status: 500 });
  }
}
