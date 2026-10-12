import assert from "node:assert/strict";
import test from "node:test";

import { parentPlayerSelect } from "../src/domain/authorization/player-views.ts";
import { parseEvaluationRating } from "../src/domain/evaluations/rating.ts";

test("evaluation ratings accept the That's Tuff 1-5 scale and Not Assessed", () => {
  assert.equal(parseEvaluationRating(1), 1);
  assert.equal(parseEvaluationRating("5"), 5);
  assert.equal(parseEvaluationRating(null), null);
  assert.equal(parseEvaluationRating(undefined), null);
  assert.equal(parseEvaluationRating(""), null);
});

test("evaluation ratings reject values outside the 1-5 integer scale", () => {
  for (const value of [0, 6, -1, 2.5, "abc", Number.NaN]) {
    assert.throws(() => parseEvaluationRating(value), /integer from 1 to 5/);
  }
});

test("parent player view uses an explicit privacy allowlist", () => {
  const topLevelKeys = Object.keys(parentPlayerSelect);

  for (const forbidden of [
    "birthDate",
    "yearsPlaying",
    "playingExperience",
    "selfReportedNeeds",
    "trainingLimitations",
    "trainerNotes",
    "coachTags",
    "trainingSessions",
  ]) {
    assert.equal(topLevelKeys.includes(forbidden), false, `${forbidden} must remain trainer-only`);
  }

  assert.deepEqual(parentPlayerSelect.progressEvents.where, { parentVisible: true });

  const ratingSelect = parentPlayerSelect.evaluations.select.ratings.select;
  assert.equal("note" in ratingSelect, false);
  assert.equal("evidence" in ratingSelect, false);
  assert.equal("observationTags" in ratingSelect, false);
});

test("parent player view exposes only the approved athlete basics at top level", () => {
  const approvedBasics = [
    "id",
    "firstName",
    "lastName",
    "preferredName",
    "classYear",
    "height",
    "position",
    "schoolTeam",
    "goals",
    "developmentFocuses",
    "evaluations",
    "progressEvents",
    "achievements",
    "assignedWork",
  ].sort();

  assert.deepEqual(Object.keys(parentPlayerSelect).sort(), approvedBasics);
});
