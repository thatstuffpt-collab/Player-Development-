/** Database filters for parent-owned athlete records. */
export function guardianPlayersWhere(guardianId: string) {
  return { guardianId };
}

export function guardianPlayerWhere(guardianId: string, playerId: string) {
  return { guardianId_playerId: { guardianId, playerId } };
}
