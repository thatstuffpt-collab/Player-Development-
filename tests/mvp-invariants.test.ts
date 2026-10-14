import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { parentPlayerSelect } from "../src/domain/authorization/player-views.ts";

const readSource = (path: string) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("reevaluations create a new historical evaluation using the previous template", async () => {
  const source = await readSource("src/app/api/trainer/players/[id]/reevaluations/route.ts");

  assert.match(source, /tx\.evaluation\.create\s*\(/);
  assert.match(source, /templateId:\s*previous\.templateId/);
  assert.doesNotMatch(source, /tx\.evaluation\.update\s*\(/);
  assert.doesNotMatch(source, /prisma\.evaluation\.update\s*\(/);
});

test("completed evaluation meaning remains reconstructable from template and criterion metadata", () => {
  const evaluationSelect = parentPlayerSelect.evaluations.select;

  assert.deepEqual(evaluationSelect.template.select, {
    id: true,
    name: true,
    version: true,
  });

  assert.deepEqual(evaluationSelect.ratings.select.criterion.select, {
    key: true,
    label: true,
    sortOrder: true,
  });
});

test("parent detail access is enforced by the guardian-player relationship on the server", async () => {
  const source = await readSource("src/app/api/parent/players/[id]/route.ts");

  assert.match(source, /requireAppUser\(request, \["GUARDIAN"\]\)/);
  assert.match(source, /guardianId_playerId/);
  assert.match(source, /guardianId:\s*user\.id/);
  assert.match(source, /playerId:\s*id/);
  assert.match(source, /status:\s*404/);
});

test("trainer player access is tenant-scoped on the server", async () => {
  const source = await readSource("src/app/api/trainer/players/[id]/route.ts");

  assert.match(source, /requireAppUser\(request, \["TRAINER", "ADMIN"\]\)/);
  assert.match(source, /tenantPlayerWhere\(user, id\)/);
  assert.match(source, /requireTenantPlayer\(user, id\)/);
});

test("parent APIs never select trainer-private fields", () => {
  const topLevel = Object.keys(parentPlayerSelect);
  for (const field of [
    "trainerNotes",
    "coachTags",
    "trainingSessions",
    "birthDate",
    "yearsPlaying",
    "playingExperience",
    "selfReportedNeeds",
    "trainingLimitations",
  ]) {
    assert.equal(topLevel.includes(field), false, `${field} must remain trainer-only`);
  }

  const ratingSelect = parentPlayerSelect.evaluations.select.ratings.select;
  assert.equal("observationTags" in ratingSelect, false);
  assert.equal("note" in ratingSelect, false);
  assert.equal("evidence" in ratingSelect, false);

  const progressSelect = parentPlayerSelect.progressEvents.select;
  assert.equal("context" in progressSelect, false);
  assert.equal("notes" in progressSelect, false);
  assert.equal("nextTime" in progressSelect, false);
  assert.deepEqual(parentPlayerSelect.progressEvents.where, { parentVisible: true });
});


test("guardian management is trainer-authorized, player-scoped, and never reuses trainer identities", async () => {
  const source = await readSource("src/app/api/trainer/players/[id]/guardians/route.ts");

  assert.match(source, /requireAppUser\(request, \["TRAINER", "ADMIN"\]\)/);
  assert.match(source, /requireTenantPlayer\(user, playerId\)/);
  assert.match(source, /guardian\.role !== "GUARDIAN"/);
  assert.match(source, /guardianId_playerId/);
});

test("baseline guardian connection preserves shared rating validation", async () => {
  const source = await readSource("src/app/api/trainer/players/[id]/baseline/route.ts");

  assert.match(source, /parseEvaluationRating\(item\.rating\)/);
  assert.match(source, /existingGuardian && existingGuardian\.role !== "GUARDIAN"/);
});
