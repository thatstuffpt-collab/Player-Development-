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


test("player edit and archive preserve required identity and history semantics", async () => {
  const detail = await readSource("src/app/api/trainer/players/[id]/route.ts");
  const list = await readSource("src/app/api/trainer/players/route.ts");

  assert.match(detail, /First name is required\./);
  assert.match(detail, /Last name is required\./);
  assert.match(detail, /data: \{ archivedAt: new Date\(\) \}/);
  assert.match(list, /archivedAt: null/);
});


test("Quick Logs support explicit parent sharing and custom shooting locations", async () => {
  const sessionPage = await readSource("src/app/trainer/players/[id]/session/page.tsx");
  const createLog = await readSource("src/app/api/trainer/sessions/[id]/logs/route.ts");
  const editLog = await readSource("src/app/api/trainer/sessions/[id]/logs/[logId]/route.ts");

  assert.match(sessionPage, /Free Throw Line \(15 ft\)/);
  assert.match(sessionPage, /Custom location/);
  assert.match(sessionPage, /Share this result with parent\/guardian/);
  assert.match(createLog, /parentVisible: body\.parentVisible === true/);
  assert.match(editLog, /parentVisible: body\.parentVisible === undefined \? undefined : body\.parentVisible === true/);
});

test("parent athlete API returns only starting and current evaluation checkpoints", async () => {
  const parentRoute = await readSource("src/app/api/parent/players/[id]/route.ts");

  assert.match(parentRoute, /const latest = evaluations\[0\]/);
  assert.match(parentRoute, /const first = evaluations\.at\(-1\)/);
  assert.match(parentRoute, /evaluations: parentEvaluations/);
});

test("planned workout save is re-read from the server before confirmation", async () => {
  const sessionPage = await readSource("src/app/trainer/players/[id]/session/page.tsx");

  assert.match(sessionPage, /const confirmed = await fetchWorkspace\(params\.id\)/);
  assert.match(sessionPage, /Planned workout saved and confirmed\./);
});


test("trainer athlete results can explicitly toggle parent visibility", async () => {
  const detail = await readSource("src/app/api/trainer/players/[id]/route.ts");
  const page = await readSource("src/app/trainer/players/[id]/page.tsx");

  assert.match(detail, /body\.action === "setProgressVisibility"/);
  assert.match(detail, /parentVisible: body\.parentVisible === true/);
  assert.match(page, /Trainer-shared results/);
  assert.match(page, /Share with parent/);
  assert.match(page, /Stop sharing/);
});


test("group and camp practice plans are tenant-scoped and coach-printable", async () => {
  const collection = await readSource("src/app/api/trainer/practice-plans/route.ts");
  const detail = await readSource("src/app/api/trainer/practice-plans/[id]/route.ts");
  const page = await readSource("src/app/trainer/practice-plans/page.tsx");

  assert.match(collection, /requireAppUser\(request, \["TRAINER", "ADMIN"\]\)/);
  assert.match(collection, /tenantId: user\.tenantId/);
  assert.match(detail, /where: \{ id, tenantId: user\.tenantId \}/);
  assert.match(page, /Build from your drill library/);
  assert.match(page, /Print \/ Save PDF/);
  assert.match(page, /window\.print\(\)/);
});


test("Group/Camps is a first-class trainer navigation destination", async () => {
  const layout = await readSource("src/app/trainer/layout.tsx");
  const hub = await readSource("src/app/trainer/groups-camps/page.tsx");

  assert.match(layout, /href="\/trainer\/groups-camps">Group\/Camps<\/Link>/);
  assert.match(hub, /href="\/trainer\/practice-plans"/);
  assert.match(hub, /href="\/trainer\/evaluate\/camp"/);
});


test("managed drill library is tenant-scoped and supports CSV replacement plus aliases", async () => {
  const api = await readSource("src/app/api/trainer/drills/route.ts");
  const page = await readSource("src/app/trainer/drills/page.tsx");
  const individual = await readSource("src/app/trainer/players/[id]/session/page.tsx");
  const groupCamp = await readSource("src/app/trainer/practice-plans/page.tsx");

  assert.match(api, /requireAppUser\(request, \["TRAINER", "ADMIN"\]\)/);
  assert.match(api, /tenantId: user\.tenantId/);
  assert.match(api, /mode === "replace"/);
  assert.match(api, /tenantId_normalizedName/);
  assert.match(page, /Download Optional Template/);
  assert.match(page, /Upload Spreadsheet/);
  assert.match(page, /Alternate Names/);
  assert.match(page, /Edit Library in App/);
  assert.match(individual, /authenticatedFetch\("\/api\/trainer\/drills"\)/);
  assert.match(groupCamp, /authenticatedFetch\("\/api\/trainer\/drills"\)/);
});


test("drill library template is a real Excel workflow with simple coaching columns", async () => {
  const page = await readSource("src/app/trainer/drills/page.tsx");
  const templateRoute = await readSource("src/app/api/trainer/drills/template/route.ts");
  const previewRoute = await readSource("src/app/api/trainer/drills/preview/route.ts");
  const importRoute = await readSource("src/app/api/trainer/drills/route.ts");

  assert.match(page, /Download Optional Template \(\.xlsx\)/);
  assert.match(page, /Drill Name/);
  assert.match(page, /What It Works On/);
  assert.match(page, /Alternate Names/);
  assert.match(templateRoute, /application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet/);
  assert.match(previewRoute, /parseDrillTemplateXlsx/);
  assert.match(importRoute, /raw\.Category/);
  assert.match(importRoute, /raw\["What It Works On"\]/);
});


test("drill library can be edited directly inside the app", async () => {
  const page = await readSource("src/app/trainer/drills/page.tsx");

  assert.match(page, /Edit Library in App/);
  assert.match(page, /\+ Add Drill/);
  assert.match(page, /Save Library/);
  assert.match(page, /What It Works On/);
  assert.match(page, /Alternate Names/);
  assert.match(page, /mode: "replace"/);
});


test("drill cards expose a tenant-scoped delete action", async () => {
  const page = await readSource("src/app/trainer/drills/page.tsx");
  const api = await readSource("src/app/api/trainer/drills/route.ts");

  assert.match(page, /Delete Drill/);
  assert.match(page, /action: "delete"/);
  assert.match(api, /if \(action === "delete"\)/);
  assert.match(api, /tenantId: user\.tenantId/);
  assert.match(api, /id\.startsWith\("default-"\)/);
  assert.match(api, /isActive: false/);
  assert.match(api, /tenantDrillCount === 0/);
});


test("drill editor keeps stable row keys while typing", async () => {
  const page = await readSource("src/app/trainer/drills/page.tsx");

  assert.match(page, /className="drill-editor-row" key=\{index\}/);
  assert.doesNotMatch(page, /key=\{\`\$\{index\}-\$\{row\["Drill Name"\]\}\`\}/);
});
