-- Bootstrap the first production trainer account for That's Tuff Player Development.
-- Firebase Authentication will link this row to a Firebase UID on first successful sign-in.

INSERT INTO "User" (
  "id",
  "email",
  "displayName",
  "role",
  "createdAt",
  "updatedAt"
)
VALUES (
  'trainer-shandon-hicks',
  'shandonhicks10@yahoo.com',
  'Shandon Hicks',
  'TRAINER',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("email") DO UPDATE
SET
  "displayName" = EXCLUDED."displayName",
  "role" = 'TRAINER',
  "updatedAt" = CURRENT_TIMESTAMP;
