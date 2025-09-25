/*
  Warnings:

  - The values [DRINK_WATER_OR_TEA] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ActivityType_new" AS ENUM ('SITTING_MEDITATION', 'CHANTING', 'ALMS_WALK', 'TEMPLE_WALK', 'TEMPLE_SWEEPING', 'TEMPLE_CHORES', 'ARM_SWING', 'WALKING_MEDITATION', 'DRINK_PANA_ZERO_CAL');
ALTER TABLE "public"."activities" ALTER COLUMN "activity_type" TYPE "public"."ActivityType_new" USING ("activity_type"::text::"public"."ActivityType_new");
ALTER TYPE "public"."ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "public"."ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;
