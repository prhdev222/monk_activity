/*
  Warnings:

  - You are about to drop the column `quit_attempts` on the `smoking_tracking` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."smoking_tracking" DROP COLUMN "quit_attempts",
ADD COLUMN     "craving_level" INTEGER;
