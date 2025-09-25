-- CreateEnum
CREATE TYPE "public"."ActivityType" AS ENUM ('SITTING_MEDITATION', 'CHANTING', 'ALMS_WALK', 'TEMPLE_WALK', 'TEMPLE_SWEEPING', 'TEMPLE_CHORES', 'ARM_SWING', 'WALKING_MEDITATION', 'DRINK_WATER_OR_TEA');

-- CreateTable
CREATE TABLE "public"."users" (
    "user_id" TEXT NOT NULL,
    "monk_name" TEXT NOT NULL,
    "temple_name" TEXT NOT NULL,
    "age" INTEGER,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "target_weight" DOUBLE PRECISION,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."activities" (
    "activity_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "activity_type" "public"."ActivityType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "intensity" TEXT,
    "calories_burned" INTEGER,
    "notes" TEXT,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("activity_id")
);

-- CreateTable
CREATE TABLE "public"."smoking_tracking" (
    "record_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "cigarettes_count" INTEGER NOT NULL,
    "money_saved" DECIMAL(65,30),
    "quit_attempts" INTEGER,

    CONSTRAINT "smoking_tracking_pkey" PRIMARY KEY ("record_id")
);

-- CreateIndex
CREATE INDEX "activities_user_id_date_idx" ON "public"."activities"("user_id", "date");

-- CreateIndex
CREATE INDEX "smoking_tracking_user_id_date_idx" ON "public"."smoking_tracking"("user_id", "date");

-- AddForeignKey
ALTER TABLE "public"."activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."smoking_tracking" ADD CONSTRAINT "smoking_tracking_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
