-- Initial production schema for That's Tuff Player Development.
-- Generated from the validated MVP domain model and intentionally kept in source control.

CREATE TYPE "UserRole" AS ENUM ('TRAINER', 'GUARDIAN', 'ADMIN');
CREATE TYPE "GoalType" AS ENUM ('BIG_PICTURE', 'DEVELOPMENT');
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'ARCHIVED');
CREATE TYPE "AchievementType" AS ENUM ('TEAM_SELECTION', 'AWARD', 'OFFER', 'PERSONAL_MILESTONE', 'RATING_IMPROVEMENT', 'TRAINING_MILESTONE', 'CAMP_RECOGNITION', 'OTHER');
CREATE TYPE "WorkStatus" AS ENUM ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "SessionFocusArea" AS ENUM ('BALL_HANDLING', 'FINISHING', 'SHOOTING', 'DEFENSE', 'FOOTWORK', 'DECISION_MAKING', 'CONDITIONING', 'OTHER');
CREATE TYPE "ProgressEventType" AS ENUM ('SHOOTING_RESULT', 'DRIBBLING_RESULT', 'DRILL_PROGRESSION', 'GOAL_CHECK', 'COACH_OBSERVATION', 'OTHER');
CREATE TYPE "ProgressNextStep" AS ENUM ('GOAL_MET', 'KEEP_PROGRESSING', 'REVISIT_NEXT_SESSION', 'CHANGE_FOCUS');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "displayName" TEXT,
  "role" "UserRole" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Player" (
  "id" TEXT NOT NULL,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "preferredName" TEXT,
  "birthDate" TIMESTAMP(3),
  "classYear" INTEGER,
  "height" TEXT,
  "position" TEXT,
  "schoolTeam" TEXT,
  "yearsPlaying" INTEGER,
  "playingExperience" TEXT,
  "selfReportedNeeds" TEXT,
  "trainingLimitations" TEXT,
  "archivedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GuardianPlayer" (
  "id" TEXT NOT NULL,
  "guardianId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "GuardianPlayer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Goal" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "type" "GoalType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
  "targetDate" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvaluationTemplate" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "version" INTEGER NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EvaluationTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvaluationCriterion" (
  "id" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL,
  CONSTRAINT "EvaluationCriterion_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Evaluation" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "templateId" TEXT NOT NULL,
  "evaluatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "summary" TEXT,
  "nextFocus" TEXT,
  "priorityAreas" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "shortTermGoal" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EvaluationRating" (
  "id" TEXT NOT NULL,
  "evaluationId" TEXT NOT NULL,
  "criterionId" TEXT NOT NULL,
  "rating" INTEGER,
  "observationTags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "note" TEXT,
  "evidence" TEXT,
  CONSTRAINT "EvaluationRating_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EvaluationRating_rating_check" CHECK ("rating" IS NULL OR ("rating" >= 1 AND "rating" <= 5))
);

CREATE TABLE "ProgressEvent" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "sessionId" TEXT,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "type" "ProgressEventType" NOT NULL DEFAULT 'OTHER',
  "category" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "context" TEXT,
  "notes" TEXT,
  "nextStep" "ProgressNextStep",
  "nextTime" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProgressEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DevelopmentFocus" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "focus" TEXT NOT NULL,
  "reason" TEXT,
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DevelopmentFocus_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Achievement" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "type" "AchievementType" NOT NULL DEFAULT 'OTHER',
  "title" TEXT NOT NULL,
  "description" TEXT,
  "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssignedWork" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "WorkStatus" NOT NULL DEFAULT 'ASSIGNED',
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "dueAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AssignedWork_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainerNote" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrainerNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlayerCoachTag" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlayerCoachTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TrainingSession" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "primaryFocus" "SessionFocusArea" NOT NULL,
  "customFocus" TEXT,
  "sessionGoal" TEXT,
  "summary" TEXT,
  "nextSessionFocus" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PracticePlanItem" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "notes" TEXT,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  CONSTRAINT "PracticePlanItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "GuardianPlayer_guardianId_playerId_key" ON "GuardianPlayer"("guardianId", "playerId");
CREATE INDEX "GuardianPlayer_playerId_idx" ON "GuardianPlayer"("playerId");
CREATE INDEX "Goal_playerId_status_idx" ON "Goal"("playerId", "status");
CREATE UNIQUE INDEX "EvaluationTemplate_name_version_key" ON "EvaluationTemplate"("name", "version");
CREATE UNIQUE INDEX "EvaluationCriterion_templateId_key_key" ON "EvaluationCriterion"("templateId", "key");
CREATE UNIQUE INDEX "EvaluationCriterion_templateId_sortOrder_key" ON "EvaluationCriterion"("templateId", "sortOrder");
CREATE INDEX "Evaluation_playerId_evaluatedAt_idx" ON "Evaluation"("playerId", "evaluatedAt");
CREATE UNIQUE INDEX "EvaluationRating_evaluationId_criterionId_key" ON "EvaluationRating"("evaluationId", "criterionId");
CREATE INDEX "EvaluationRating_criterionId_idx" ON "EvaluationRating"("criterionId");
CREATE INDEX "ProgressEvent_playerId_occurredAt_idx" ON "ProgressEvent"("playerId", "occurredAt");
CREATE INDEX "ProgressEvent_sessionId_idx" ON "ProgressEvent"("sessionId");
CREATE INDEX "DevelopmentFocus_playerId_completedAt_idx" ON "DevelopmentFocus"("playerId", "completedAt");
CREATE INDEX "Achievement_playerId_achievedAt_idx" ON "Achievement"("playerId", "achievedAt");
CREATE INDEX "AssignedWork_playerId_status_idx" ON "AssignedWork"("playerId", "status");
CREATE INDEX "TrainerNote_playerId_createdAt_idx" ON "TrainerNote"("playerId", "createdAt");
CREATE UNIQUE INDEX "PlayerCoachTag_playerId_label_key" ON "PlayerCoachTag"("playerId", "label");
CREATE INDEX "PlayerCoachTag_playerId_isActive_idx" ON "PlayerCoachTag"("playerId", "isActive");
CREATE INDEX "TrainingSession_playerId_scheduledFor_idx" ON "TrainingSession"("playerId", "scheduledFor");
CREATE UNIQUE INDEX "PracticePlanItem_sessionId_sortOrder_key" ON "PracticePlanItem"("sessionId", "sortOrder");

ALTER TABLE "GuardianPlayer" ADD CONSTRAINT "GuardianPlayer_guardianId_fkey" FOREIGN KEY ("guardianId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "GuardianPlayer" ADD CONSTRAINT "GuardianPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvaluationCriterion" ADD CONSTRAINT "EvaluationCriterion_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EvaluationTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "EvaluationTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "EvaluationRating" ADD CONSTRAINT "EvaluationRating_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EvaluationRating" ADD CONSTRAINT "EvaluationRating_criterionId_fkey" FOREIGN KEY ("criterionId") REFERENCES "EvaluationCriterion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProgressEvent" ADD CONSTRAINT "ProgressEvent_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DevelopmentFocus" ADD CONSTRAINT "DevelopmentFocus_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AssignedWork" ADD CONSTRAINT "AssignedWork_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainerNote" ADD CONSTRAINT "TrainerNote_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerCoachTag" ADD CONSTRAINT "PlayerCoachTag_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProgressEvent" ADD CONSTRAINT "ProgressEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PracticePlanItem" ADD CONSTRAINT "PracticePlanItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the immutable first evaluation template so new players can be evaluated immediately.
INSERT INTO "EvaluationTemplate" ("id","name","description","version","isActive")
VALUES ('ttpt-default-v1','That''s Tuff Default Evaluation','Initial 12-category MVP evaluation template',1,true);

INSERT INTO "EvaluationCriterion" ("id","templateId","key","label","sortOrder") VALUES
('ttpt-v1-ball-control','ttpt-default-v1','ball-control','Ball Control',1),
('ttpt-v1-finishing','ttpt-default-v1','finishing','Finishing',2),
('ttpt-v1-shooting','ttpt-default-v1','shooting','Shooting',3),
('ttpt-v1-decision-making','ttpt-default-v1','decision-making','Decision Making',4),
('ttpt-v1-playing-under-pressure','ttpt-default-v1','playing-under-pressure','Playing Under Pressure',5),
('ttpt-v1-off-ball-awareness','ttpt-default-v1','off-ball-awareness','Off-Ball Awareness',6),
('ttpt-v1-on-ball-defense','ttpt-default-v1','on-ball-defense','On-Ball Defense',7),
('ttpt-v1-defensive-awareness','ttpt-default-v1','defensive-awareness','Defensive Awareness',8),
('ttpt-v1-effort-competitiveness','ttpt-default-v1','effort-competitiveness','Effort & Competitiveness',9),
('ttpt-v1-coachability','ttpt-default-v1','coachability','Coachability',10),
('ttpt-v1-confidence','ttpt-default-v1','confidence','Confidence',11),
('ttpt-v1-response-to-mistakes','ttpt-default-v1','response-to-mistakes','Response to Mistakes',12);
