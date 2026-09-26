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
