import type { User } from "@/generated/prisma/client";
import { AuthError } from "@/domain/authorization/identity";
import { getPrisma } from "@/lib/db";

export function tenantPlayerWhere(user: Pick<User, "tenantId">, playerId: string) {
  return { id: playerId, tenantId: user.tenantId };
}

export async function requireTenantPlayer(
  user: Pick<User, "tenantId">,
  playerId: string,
) {
  const prisma = getPrisma();
  const player = await prisma.player.findFirst({
    where: tenantPlayerWhere(user, playerId),
    select: { id: true, tenantId: true, archivedAt: true },
  });

  if (!player) {
    throw new AuthError("Player not found.", 404);
  }

  return player;
}

export async function requireTenantSession(
  user: Pick<User, "tenantId">,
  sessionId: string,
) {
  const prisma = getPrisma();
  const session = await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      player: { tenantId: user.tenantId },
    },
    select: { id: true, playerId: true },
  });

  if (!session) {
    throw new AuthError("Session not found.", 404);
  }

  return session;
}
