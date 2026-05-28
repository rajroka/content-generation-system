/*
  Warnings:

  - The values [TWITTER,LINKEDIN] on the enum `Platform` will be removed. If these variants are still used in the database, this will fail.
  - The values [TWITTER,LINKEDIN] on the enum `SocialPlatform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Platform_new" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'TIKTOK');
ALTER TABLE "Generation" ALTER COLUMN "platform" TYPE "Platform_new" USING ("platform"::text::"Platform_new");
ALTER TABLE "ScheduledPost" ALTER COLUMN "platforms" TYPE "Platform_new"[] USING ("platforms"::text::"Platform_new"[]);
ALTER TYPE "Platform" RENAME TO "Platform_old";
ALTER TYPE "Platform_new" RENAME TO "Platform";
DROP TYPE "public"."Platform_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "SocialPlatform_new" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'TIKTOK');
ALTER TABLE "SocialAccount" ALTER COLUMN "platform" TYPE "SocialPlatform_new" USING ("platform"::text::"SocialPlatform_new");
ALTER TYPE "SocialPlatform" RENAME TO "SocialPlatform_old";
ALTER TYPE "SocialPlatform_new" RENAME TO "SocialPlatform";
DROP TYPE "public"."SocialPlatform_old";
COMMIT;
