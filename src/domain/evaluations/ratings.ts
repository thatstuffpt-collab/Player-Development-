/**
 * Baseline and reevaluation share the same input validation.
 * This module is independent of database and runtime configuration.
 */
export class EvaluationInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvaluationInputError";
  }
}

export type NormalizedEvaluationRating = {
  criterionId: string;
  rating: number | null;
  note: string | null;
  observationTags?: string[];
};

export function normalizeEvaluationRatings(
  input: unknown,
  criterionByLabel: ReadonlyMap<string, string>,
  options: { includeObservationTags?: boolean } = {},
): NormalizedEvaluationRating[] {
  if (!Array.isArray(input)) return [];

  const seen = new Set<string>();
  return input.map((raw) => {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      throw new EvaluationInputError("Invalid evaluation rating entry.");
    }

    const item = raw as Record<string, unknown>;
    const category = String(item.category ?? "");
    const criterionId = criterionByLabel.get(category);
    if (!criterionId) {
      throw new EvaluationInputError(`Unknown evaluation category: ${category}`);
    }
    if (seen.has(criterionId)) {
      throw new EvaluationInputError(`Duplicate evaluation category: ${category}`);
    }
    seen.add(criterionId);

    const rating =
      item.rating === null || item.rating === undefined
        ? null
        : Number(item.rating);
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      throw new EvaluationInputError(`Invalid rating for ${category}`);
    }

    const result: NormalizedEvaluationRating = {
      criterionId,
      rating,
      note: String(item.note ?? "").trim() || null,
    };
    if (options.includeObservationTags) {
      result.observationTags = Array.isArray(item.tags) ? item.tags.map(String) : [];
    }
    return result;
  });
}
