/*
  Warnings:

  - The values [ENTERPRISE] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Plan_new" AS ENUM ('FREE', 'PRO');
ALTER TABLE "public"."User" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TABLE "PlanLimit" ALTER COLUMN "plan" TYPE "Plan_new" USING ("plan"::text::"Plan_new");
ALTER TYPE "Plan" RENAME TO "Plan_old";
ALTER TYPE "Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
ALTER TABLE "User" ALTER COLUMN "plan" SET DEFAULT 'FREE';
COMMIT;

-- AlterTable
ALTER TABLE "ScheduledPost" ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "zernioPostId" TEXT;

-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "zernioProfileId" TEXT;

-- CreateTable
CREATE TABLE "BrandVoice" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'CASUAL',
    "style" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "avoidWords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandVoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BrandVoice_userId_key" ON "BrandVoice"("userId");

-- AddForeignKey
ALTER TABLE "BrandVoice" ADD CONSTRAINT "BrandVoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
