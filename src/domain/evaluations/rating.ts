export function parseEvaluationRating(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;

  const rating = Number(value);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Evaluation rating must be an integer from 1 to 5.");
  }

  return rating;
}
