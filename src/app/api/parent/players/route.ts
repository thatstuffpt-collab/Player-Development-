import { NextResponse } from "next/server";
import { AuthError, requireAppUser } from "@/domain/authorization/identity";
import { parentPlayerSelect } from "@/domain/authorization/player-views";
import { getPrisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const user = await requireAppUser(request, ["GUARDIAN"]);
    const prisma = getPrisma();

    const relationships = await prisma.guardianPlayer.findMany({
      where: { guardianId: user.id },
      orderBy: { createdAt: "asc" },
      select: {
        player: {
          select: parentPlayerSelect,
        },
      },
    });

    return NextResponse.json({ players: relationships.map((item) => item.player) });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load parent athletes", error);
    return NextResponse.json({ error: "Could not load your athletes." }, { status: 500 });
  }
}
