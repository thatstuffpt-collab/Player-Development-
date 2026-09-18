import type { Prisma } from "@/generated/prisma/client";

/**
 * Parent-facing data is allowlisted here.
 *
 * Important: adding a field to the Prisma schema does NOT make it parent-visible.
 * A field must be deliberately added to this select after a privacy review.
 */
export const parentPlayerSelect = {
  id: true,
  firstName: true,
  lastName: true,
  preferredName: true,
  classYear: true,
  height: true,
  position: true,
  schoolTeam: true,

  goals: {
    where: { status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      status: true,
      targetDate: true,
      completedAt: true,
      createdAt: true,
    },
  },

  developmentFocuses: {
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      focus: true,
      reason: true,
      startedAt: true,
      completedAt: true,
    },
  },

  evaluations: {
    orderBy: { evaluatedAt: "desc" },
    select: {
      id: true,
      evaluatedAt: true,
      summary: true,
      nextFocus: true,
      priorityAreas: true,
      shortTermGoal: true,
      template: {
        select: {
          id: true,
          name: true,
          version: true,
        },
      },
      ratings: {
        select: {
          id: true,
          rating: true,
          criterion: {
            select: {
              key: true,
              label: true,
              sortOrder: true,
            },
          },
        },
        orderBy: {
          criterion: {
            sortOrder: "asc",
          },
        },
      },
    },
  },

  progressEvents: {
    where: { parentVisible: true },
    orderBy: { occurredAt: "desc" },
    select: {
      id: true,
      occurredAt: true,
      type: true,
      category: true,
      title: true,
      result: true,
      nextStep: true,
    },
  },

  achievements: {
    orderBy: { achievedAt: "desc" },
    select: {
      id: true,
      type: true,
      title: true,
      description: true,
      achievedAt: true,
    },
  },

  assignedWork: {
    where: { status: { not: "ARCHIVED" } },
    orderBy: { assignedAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      assignedAt: true,
      dueAt: true,
      completedAt: true,
    },
  },
} satisfies Prisma.PlayerSelect;

export type ParentPlayerView = Prisma.PlayerGetPayload<{
  select: typeof parentPlayerSelect;
}>;

/**
 * These fields/categories are intentionally excluded from parentPlayerSelect:
 * - trainerNotes
 * - coachTags
 * - trainingSessions and practicePlan
 * - birthDate
 * - yearsPlaying / playingExperience / selfReportedNeeds
 * - trainingLimitations
 * - EvaluationRating.observationTags / note / evidence
 * - ProgressEvent.context / notes / nextTime
 *
 * Do not expose them through parent APIs unless the product/privacy decision
 * is explicitly revisited and documented.
 */
